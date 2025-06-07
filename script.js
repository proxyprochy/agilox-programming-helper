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
      <div class="actions">${renderActions(wf.order?.action, id)}</div>
      <div class="add-action" data-id="${id}">
        <button class="add-btn">+ Přidat akci</button>
      </div>
      <div class="order-fields">${renderOrderFields(wf.order)}</div>
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

  document.querySelectorAll(".add-btn").forEach(button => {
    button.addEventListener("click", e => {
      const container = button.parentElement;
      showAddActionForm(container);
    });
  });
}
function renderActions(actions, workflowId) {
  if (!actions) return "<em>Žádné akce</em>";
  return Object.entries(actions).map(([index, act]) => `
    <div class="action">
      <strong>${index}:</strong> ${act.action || '-'} → 
      <em>${act.target?.stationarea || act.target?.station || '-'}</em>
      <button onclick="editAction('${workflowId}', '${index}')">✏️</button>
    </div>
  `).join("");
}

function renderOrderFields(order) {
  if (!order) return "";
  const { action, ...others } = order;
  return Object.entries(others).map(([key, obj]) => {
    const entries = Object.entries(obj)
      .map(([k, v]) => `
        <div class="keyval" data-key="${key}" data-subkey="${k}">
          <label>${k}: <input type="text" value="${v}" data-key="${key}" data-subkey="${k}"></label>
          <button class="remove-field" title="Smazat">🗑️</button>
        </div>`).join("");

    return `
      <div class="readonly-block editable" data-block="${key}">
        <strong>${key}:</strong>
        ${entries}
        <div class="keyval-add">
          <input type="text" placeholder="klíč" class="new-key">
          <input type="text" placeholder="hodnota" class="new-val">
          <button class="add-field">➕ Přidat</button>
        </div>
      </div>
    `;
  }).join("");
}

document.addEventListener("input", e => {
  if (e.target.matches("input[data-key][data-subkey]")) {
    const block = e.target.dataset.key;
    const key = e.target.dataset.subkey;
    const container = e.target.closest(".workflow");
    const id = Object.keys(workflowData).find(k => container.innerHTML.includes(`data-id="${k}"`));
    if (id && workflowData[id].order?.[block]) {
      workflowData[id].order[block][key] = e.target.value;
    }
  }
});

document.addEventListener("click", e => {
  if (e.target.matches(".remove-field")) {
    const div = e.target.closest(".keyval");
    const block = div.dataset.key;
    const key = div.dataset.subkey;
    const container = e.target.closest(".workflow");
    const id = Object.keys(workflowData).find(k => container.innerHTML.includes(`data-id="${k}"`));
    if (id && workflowData[id].order?.[block]) {
      delete workflowData[id].order[block][key];
      renderWorkflows();
    }
  }

  if (e.target.matches(".add-field")) {
    const blockDiv = e.target.closest(".readonly-block");
    const block = blockDiv.dataset.block;
    const container = e.target.closest(".workflow");
    const id = Object.keys(workflowData).find(k => container.innerHTML.includes(`data-id="${k}"`));

    const newKey = blockDiv.querySelector(".new-key").value.trim();
    const newVal = blockDiv.querySelector(".new-val").value.trim();
    if (newKey && id) {
      if (!workflowData[id].order[block]) workflowData[id].order[block] = {};
      workflowData[id].order[block][newKey] = newVal;
      renderWorkflows();
    }
  }
});

function editAction(workflowId, index) {
  const container = document.querySelector(`[data-id="${workflowId}"]`).parentElement;
  const action = workflowData[workflowId].order.action[index];
  const template = document.getElementById("action-template");
  const clone = template.content.cloneNode(true);

  clone.querySelector(".action-type").value = action.action || "pickup";
  if (action.target?.station) {
    clone.querySelector(".target-type").value = "station";
    clone.querySelector(".target-value").value = action.target.station;
  } else {
    clone.querySelector(".target-type").value = "stationarea";
    clone.querySelector(".target-value").value = action.target?.stationarea || "";
  }

  const confirmBtn = clone.querySelector(".confirm-add");
  const cancelBtn = clone.querySelector(".cancel-add");

  confirmBtn.addEventListener("click", () => {
    const type = clone.querySelector(".action-type").value;
    const tType = clone.querySelector(".target-type").value;
    const tValue = clone.querySelector(".target-value").value.trim();

    const newAction = { action: type, target: {} };
    newAction.target[tType] = tValue;

    workflowData[workflowId].order.action[index] = newAction;
    renderWorkflows();
  });

  cancelBtn.addEventListener("click", () => renderWorkflows());

  container.querySelector(".add-action").innerHTML = "";
  container.querySelector(".add-action").appendChild(clone);
}

function showAddActionForm(container) {
  const template = document.getElementById("action-template");
  const clone = template.content.cloneNode(true);
  const id = container.dataset.id;

  const confirmBtn = clone.querySelector(".confirm-add");
  const cancelBtn = clone.querySelector(".cancel-add");

  confirmBtn.addEventListener("click", () => {
    const actionType = clone.querySelector(".action-type").value;
    const targetType = clone.querySelector(".target-type").value;
    const targetValue = clone.querySelector(".target-value").value.trim();

    if (!targetValue) {
      alert("Zadej cílovou hodnotu");
      return;
    }

    const wf = workflowData[id];
    if (!wf.order) wf.order = {};
    if (!wf.order.action) wf.order.action = {};
    const nextIndex = Object.keys(wf.order.action).length.toString();

    const newAction = { action: actionType, target: {} };
    newAction.target[targetType] = targetValue;

    wf.order.action[nextIndex] = newAction;

    renderWorkflows();
  });

  cancelBtn.addEventListener("click", () => {
    renderWorkflows();
  });

  container.innerHTML = "";
  container.appendChild(clone);
}
