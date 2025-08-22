// Model para dados de controle da API

const controlData = {
  status: 'API online',
  lastReset: null
};

function getStatus() {
  return { status: controlData.status, lastReset: controlData.lastReset };
}

function setLastReset(date) {
  controlData.lastReset = date;
}

module.exports = { getStatus, setLastReset };
