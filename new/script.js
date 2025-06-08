function renderWorkflow(data, container) {
  container.innerHTML = "";

  if (!data || typeof data !== "object") {
    container.innerHTML = '<p class="error">❌ JSON není validní objekt.</p>';
    return;
  }

  const keys = Object.keys(data);
  if (keys.length !== 1) {
    container.innerHTML = '<p class="error">❌ JSON musí obsahovat právě jeden kořenový objekt (např. "7").</p>';
    return;
  }

  const id = keys[0];
  const entry = data[id];
  const workflow = document.createElement("div");
  workflow.className = "workflow";

  workflow.innerHTML = `
    <div class="top-form">
      <div class="form-item">
        <label>id</label><input type="text" value="${id}" readonly>
      </div>
      <div class="form-item">
        <label>name</label><input type="text" value="${entry.name ?? ''}">
      </div>
      <div class="form-item">
        <label>status</label><input type="text" value="${entry.status ?? 0}">
      </div>
    </div>
  `;

  if (entry.start) {
    const startKey = Object.keys(entry.start)[0];
    const startVal = entry.start[startKey];
    const startDiv = document.createElement("div");
    startDiv.innerHTML = `
      <div class="row">
        <label>start</label>
        <select><option>${startKey}</option></select>
        <input type="text" value="${startVal}">
      </div>`;
    workflow.appendChild(startDiv);
  }

  if (entry.order?.workflow_max_pending !== undefined) {
    const maxDiv = document.createElement("div");
    maxDiv.innerHTML = `
      <div class="row">
        <label>workflow_max_pending</label>
        <input type="text" value="${entry.order.workflow_max_pending}">
      </div>`;
    workflow.appendChild(maxDiv);
  }

  const actions = entry.order?.action ?? {};
  Object.keys(actions).forEach((key) => {
    const a = actions[key];
    const div = document.createElement("div");
    div.className = "action";
    const targetType = a.target ? Object.keys(a.target)[0] : "";
    const targetValue = a.target ? a.target[targetType] : "";
    const eventType = a.event ? Object.keys(a.event)[0] : "";
    const eventValue = a.event ? a.event[eventType] : "";

    div.innerHTML = `
      <div class="action-header">
        <span>Action (${key})</span>
        <span class="chevron">▾</span>
      </div>
      <div class="action-body">
        <div class="row">
          <label>action</label><select><option>${a.action}</option></select>
        </div>
        ${a.target ? `
        <div class="row">
          <label>target</label>
          <select><option>${targetType}</option></select>
          <input type="text" value="${targetValue}">
        </div>` : ""}
        ${a.event ? `
        <div class="row">
          <label>event</label>
          <select><option>${eventType}</option></select>
          <select><option>${eventValue}</option></select>
        </div>` : ""}
        <a href="#" class="add-attribute" data-popup="popup-${key}">+ add action attribute</a>
        <div class="attribute-popup" id="popup-${key}">
          <button>+ event</button>
          <button>+ max_speed</button>
          <button>+ max_retries</button>
          <button>+ acceleration</button>
          <button>+ autoskip</button>
        </div>
      </div>
    `;
    workflow.appendChild(div);
  });

  container.appendChild(workflow);

  workflow.querySelectorAll('.action-header').forEach(header => {
    header.addEventListener('click', () => {
      const body = header.nextElementSibling;
      const chevron = header.querySelector('.chevron');
      const isVisible = body.style.display !== 'none';
      body.style.display = isVisible ? 'none' : 'block';
      chevron.textContent = isVisible ? '▸' : '▾';
    });
  });

  workflow.querySelectorAll('.add-attribute').forEach(link => {
    link.addEventListener('click', e => {
      e.preventDefault();
      const popupId = link.dataset.popup;
      const popup = document.getElementById(popupId);
      popup.classList.toggle('active');
    });
  });
}

document.getElementById("load-json").addEventListener("click", () => {
  const container = document.getElementById("app");
  let data;
  try {
    data = JSON.parse(document.getElementById("json-input").value);
  } catch (err) {
    container.innerHTML = `<p class="error">❌ Nevalidní JSON: ${err.message}</p>`;
    return;
  }
  renderWorkflow(data, container);
});

// Výchozí načtení
document.getElementById("json-input").value = JSON.stringify({
  "7": {
    "name": "areaA => areaB",
    "status": 1,
    "order": {
      "workflow_max_pending": 2,
      "action": {
        "0": {
          "action": "pickup",
          "target": { "station": "areaA" }
        },
        "1": {
          "action": "drop",
          "target": { "station": "areaB" },
          "event": { "no_station_left": "cancel" }
        }
      }
    }
  }
}, null, 2);

document.getElementById("load-json").click();
