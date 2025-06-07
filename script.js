let workflowData = {};

document.getElementById("fileInput").addEventListener("change", function (e) {
  const reader = new FileReader();
  reader.onload = function () {
    workflowData = JSON.parse(reader.result);
    renderWorkflows();
  };
  reader.readAsText(e.target.files[0]);
});

document.getElementById("exportBtn").addEventListener("click", function () {
  const blob = new Blob([JSON.stringify(workflowData, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "agilox-workflows.json";
  a.click();
  URL.revokeObjectURL(url);
});

function renderWorkflows() {
  const container = document.getElementById("workflows");
  container.innerHTML = "";

  for (const [id, wf] of Object.entries(workflowData)) {
    const div = document.createElement("div");
    div.className = "workflow" + (wf.status === 99 ? " disabled" : "");
    div.innerHTML = `
      <label>Název: <input type="text" value="${wf.name}" data-id="${id}" class="name-input"></label><br>
      <label>Status: 
        <select data-id="${id}" class="status-select">
          <option value="0" ${wf.status === 0 ? "selected" : ""}>✅ Enabled</option>
          <option value="99" ${wf.status === 99 ? "selected" : ""}>❌ Disabled</option>
        </select>
      </label>
      <h4>Akce:</h4>
      <div class="actions">${renderActions(wf.order?.action)}</div>
      <div class="add-action">
        <button onclick="addAction('${id}')">+ Přidat akci</button>
      </div>
    `;
    container.appendChild(div);
  }

  document.querySelectorAll(".name-input").forEach(input => {
    input.addEventListener("input", e => {
      const id = e.target.dataset.id;
      workflowData[id].name = e.target.value;
    });
  });

  document.querySelectorAll(".status-select").forEach(select => {
    select.addEventListener("change", e => {
      const id = e.target.dataset.id;
      workflowData[id].status = parseInt(e.target.value);
      renderWorkflows();
    });
  });
}

function renderActions(actions) {
  if (!actions) return "<em>Žádné akce</em>";
  return Object.entries(actions).map(([index, act]) => `
    <div class="action">
      <strong>${index}:</strong> ${act.action || '-'} → 
      <em>${act.target?.stationarea || '-'}</em>
      ${act.event ? `<br><small>🎯 Událost: ${Object.entries(act.event).map(([k,v]) => `${k} → ${v}`).join(", ")}</small>` : ""}
    </div>
  `).join("");
}

function addAction(id) {
  const wf = workflowData[id];
  if (!wf.order) wf.order = {};
  if (!wf.order.action) wf.order.action = {};

  const actions = wf.order.action;
  const newIndex = Object.keys(actions).length.toString();
  actions[newIndex] = {
    action: "pickup",
    target: {
      stationarea: "areaX"
    }
  };

  renderWorkflows();
}
