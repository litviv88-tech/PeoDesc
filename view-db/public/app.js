const state = {
  target: "local",
  table: "",
  page: 1,
  pageSize: 20,
  columns: [],
  primaryKeys: [],
  rows: [],
  dialogMode: "create",
  editKeys: {},
};

const $ = (id) => document.getElementById(id);

async function api(path, options = {}) {
  const url = new URL(path, window.location.origin);
  if (!path.includes("target=") && !url.searchParams.has("target")) {
    url.searchParams.set("target", state.target);
  }
  const res = await fetch(url, {
    headers: { "Content-Type": "application/json", ...(options.headers || {}) },
    ...options,
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || `HTTP ${res.status}`);
  return data;
}

function show(screen) {
  $("screen-connect").hidden = screen !== "connect";
  $("screen-tables").hidden = screen !== "tables";
  $("screen-table").hidden = screen !== "table";
}

async function loadTargets() {
  const data = await api("/api/targets");
  const container = $("targets");
  container.innerHTML = "";

  for (const [key, label] of [
    ["local", "Локальная БД"],
    ["work", "Рабочая БД"],
  ]) {
    const item = data[key];
    const id = `target-${key}`;
    const div = document.createElement("label");
    div.className = "target-option";
    div.innerHTML = `
      <input type="radio" name="db-target" id="${id}" value="${key}" ${item.configured ? "" : "disabled"} />
      <div>
        <strong>${label}</strong>
        <div class="muted">${item.configured ? item.masked : "URL не настроен"}</div>
      </div>`;
    container.appendChild(div);
  }

  const firstEnabled = container.querySelector('input:not([disabled])');
  if (firstEnabled) {
    firstEnabled.checked = true;
    state.target = firstEnabled.value;
    $("btn-connect").disabled = false;
  }

  container.addEventListener("change", (e) => {
    const input = e.target;
    if (input?.name === "db-target") state.target = input.value;
  });
}

async function connectAndLoadTables() {
  $("connect-error").hidden = true;
  try {
    const data = await api("/api/tables");
    const list = $("tables-list");
    list.innerHTML = "";
    for (const table of data.tables) {
      const li = document.createElement("li");
      li.innerHTML = `<span>${table}</span>`;
      const btn = document.createElement("button");
      btn.className = "btn primary";
      btn.textContent = "Открыть";
      btn.addEventListener("click", () => openTable(table));
      li.appendChild(btn);
      list.appendChild(li);
    }
    $("current-target-label").textContent =
      state.target === "work" ? "рабочая" : "локальная";
    show("tables");
  } catch (error) {
    $("connect-error").textContent = error.message;
    $("connect-error").hidden = false;
  }
}

async function openTable(table, page = 1) {
  state.table = table;
  state.page = page;
  $("table-name").textContent = table;
  $("table-error").hidden = true;
  show("table");
  await reloadTable();
}

async function reloadTable() {
  try {
    const data = await api(
      `/api/tables/${encodeURIComponent(state.table)}?page=${state.page}&pageSize=${state.pageSize}`,
    );
    state.columns = data.columns;
    state.primaryKeys = data.primaryKeys;
    state.rows = data.rows;

    $("pager-info").textContent = `Стр. ${data.page} из ${data.totalPages} · всего ${data.total}`;
    $("btn-prev").disabled = data.page <= 1;
    $("btn-next").disabled = data.page >= data.totalPages;

    renderTable();
  } catch (error) {
    $("table-error").textContent = error.message;
    $("table-error").hidden = false;
  }
}

function renderTable() {
  const thead = $("data-table").querySelector("thead");
  const tbody = $("data-table").querySelector("tbody");
  const cols = state.columns.map((c) => c.column_name);
  thead.innerHTML = `<tr>${cols.map((c) => `<th>${c}</th>`).join("")}<th>Действия</th></tr>`;
  tbody.innerHTML = "";

  for (const row of state.rows) {
    const tr = document.createElement("tr");
    tr.innerHTML = cols
      .map((c) => `<td>${formatCell(row[c])}</td>`)
      .join("");
    const td = document.createElement("td");
    td.className = "actions";
    const editBtn = document.createElement("button");
    editBtn.className = "btn";
    editBtn.textContent = "Изменить";
    editBtn.addEventListener("click", () => openEditDialog(row));
    const delBtn = document.createElement("button");
    delBtn.className = "btn";
    delBtn.textContent = "Удалить";
    delBtn.addEventListener("click", () => deleteRow(row));
    td.append(editBtn, delBtn);
    tr.appendChild(td);
    tbody.appendChild(tr);
  }
}

function formatCell(value) {
  if (value === null || value === undefined) return "NULL";
  if (typeof value === "object") return JSON.stringify(value);
  return String(value);
}

function openCreateDialog() {
  state.dialogMode = "create";
  state.editKeys = {};
  $("dialog-title").textContent = "Создать запись";
  buildFormFields({});
  $("row-dialog").showModal();
}

function openEditDialog(row) {
  state.dialogMode = "edit";
  state.editKeys = {};
  for (const pk of state.primaryKeys) state.editKeys[pk] = row[pk];
  $("dialog-title").textContent = "Изменить запись";
  buildFormFields(row, true);
  $("row-dialog").showModal();
}

function buildFormFields(row, lockPk = false) {
  const container = $("form-fields");
  container.innerHTML = "";
  for (const col of state.columns) {
    const name = col.column_name;
    const isPk = state.primaryKeys.includes(name);
    if (lockPk && isPk) continue;
    const value = row[name] ?? "";
    const field = document.createElement("label");
    field.className = "field";
    field.innerHTML = `
      <span>${name} <small>${col.data_type}${col.is_nullable === "NO" ? " · NOT NULL" : ""}</small></span>
      <input name="${name}" value="${escapeAttr(value)}" />
    `;
    container.appendChild(field);
  }
}

function escapeAttr(value) {
  return String(value).replace(/"/g, "&quot;");
}

async function submitForm(event) {
  event.preventDefault();
  const form = new FormData($("row-form"));
  const payload = Object.fromEntries(form.entries());

  try {
    if (state.dialogMode === "create") {
      await api(`/api/tables/${encodeURIComponent(state.table)}?target=${state.target}`, {
        method: "POST",
        body: JSON.stringify(payload),
      });
    } else {
      await api(`/api/tables/${encodeURIComponent(state.table)}?target=${state.target}`, {
        method: "PUT",
        body: JSON.stringify({ keys: state.editKeys, values: payload }),
      });
    }
    $("row-dialog").close();
    await reloadTable();
  } catch (error) {
    alert(error.message);
  }
}

async function deleteRow(row) {
  if (!confirm("Удалить запись?")) return;
  const keys = {};
  for (const pk of state.primaryKeys) keys[pk] = row[pk];
  try {
    await api(`/api/tables/${encodeURIComponent(state.table)}?target=${state.target}`, {
      method: "DELETE",
      body: JSON.stringify({ keys }),
    });
    await reloadTable();
  } catch (error) {
    alert(error.message);
  }
}

$("btn-connect").addEventListener("click", connectAndLoadTables);
$("btn-back-db").addEventListener("click", () => show("connect"));
$("btn-back-tables").addEventListener("click", () => show("tables"));
$("btn-prev").addEventListener("click", () => openTable(state.table, state.page - 1));
$("btn-next").addEventListener("click", () => openTable(state.table, state.page + 1));
$("btn-create").addEventListener("click", openCreateDialog);
$("btn-cancel").addEventListener("click", () => $("row-dialog").close());
$("row-form").addEventListener("submit", submitForm);

loadTargets().catch((e) => {
  $("connect-error").textContent = e.message;
  $("connect-error").hidden = false;
});
