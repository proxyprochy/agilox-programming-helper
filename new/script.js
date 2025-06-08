const data = {
  "103": {
    name: "areaB => areaA (prázdné - zruš obj)",
    status: 0,
    order: {
      action: {
        "0": {
          action: "pickup",
          target: { stationarea: "areaB" },
          event: { no_station_left: "order_cancel" }
        },
        "1": {
          action: "drop",
          target: { stationarea: "areaA" }
        }
      }
    }
  }
};

function renderWorkflow(id, container) {
  const entry = data[id];
  const { name, status, order } = entry;

  const workflow = document.createElement("div");
  workflow.className = "workflow";

  // Top form
  workflow.innerHTML = `
    <div class="top-form">
      <div class="form-item"><label>id</label><input type="text" value="${id}"></div>
      <div class="form-item"><label>name</label><input type="text" value="${name}"></div>
      <div class="form-item"><label>status</label>
        <select><option>${status}</option></select>
      </div>
    </div>
  `;

  // Actions
  const actions = order.action;
  Object.keys(actions).forEach((key) => {
    const a = actions[key];
    const actionDiv = document.createElement("div");
    actionDiv.className = "action";

    const targetType = a.target ? Object.keys(a.target)[0] : "";
    const targetValue = a.target ? a.target[targetType] : "";

    const eventType = a.event ? Object.keys(a.event)[0] : "";
    const eventValue = a.event ? a.event[eventType] : "";

    actionDiv.innerHTML = `
      <div class="action-header">
        <span>Action (${key})</span>
        <span class="chevron">▾</span>
      </div>
      <div class="action-body">
        <div class="row">
          <label>"0"</label><input type="text" value="${key}">
          <label>action</label>
          <select><option>${a.action}</option></select>
        </div>
        ${a.target ? `
        <div class="row">
          <label>target</label>
          <select><option>${targetType}</option></select>
          <input type="text" value="${targetValue}">
        </div>` : ""}
        ${a.max_speed ? `
        <div class="row deletable">
          <label>max_speed</label>
          <input type="text" value="${a.max_speed}">
          <button class="delete-btn">🗑</button>
        </div>` : ""}
        ${a.max_retries ? `
        <div class="row deletable">
          <label>max_retries</label>
          <input type="text" value="${a.max_retries}">
          <button class="delete-btn">🗑</button>
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

    workflow.appendChild(actionDiv);
  });

  container.appendChild(workflow);

  // Activate interaction
  document.querySelectorAll('.action-header').forEach(header => {
    header.addEventListener('click', () => {
      const body = header.nextElementSibling;
      const chevron = header.querySelector('.chevron');
      const isVisible = body.style.display !== 'none';
      body.style.display = isVisible ? 'none' : 'block';
      chevron.textContent = isVisible ? '▸' : '▾';
    });
  });

  document.querySelectorAll('.add-attribute').forEach(link => {
    link.addEventListener('click', e => {
      e.preventDefault();
      const popupId = link.dataset.popup;
      const popup = document.getElementById(popupId);
      popup.classList.toggle('active');
    });
  });
}

window.addEventListener("DOMContentLoaded", () => {
  const container = document.getElementById("app");
  renderWorkflow("103", container);
});
