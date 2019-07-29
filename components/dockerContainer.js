const { spawn } = require('child_process');
const StatusService = require('../service/statusService');

const DockerContainer = {
  getRunningDockerContainers: async () => {
    const containersName = spawn('docker', [
      'ps',
      '-a',
      '--format',
      '{"Label": "{{.Names}}" , "Id": "{{.ID}}", "Status": "{{.Status}}" }$%',
    ]);

    var retorno = await getContainerData(containersName);
    return retorno;
  },
};

function getContainerData(containersName) {
  const containers = [];

  var retorno = new Promise(res => {
    containersName.stdout.on('data', data => {
      const itensArray = data.toString().split('$%');
      var id = 0;

      itensArray.forEach(container => {
        if (container.trim().length > 1) {
          const item = JSON.parse(container);
          item.posicao = id++;
          containers.push(containerToItem(item));
        }
      });
    });

    containersName.on('close', () => {
      containers.length > 0 ? res(containers) : res([noContainContainer()]);
    });
  });

  return retorno;
}

function containerToItem(container) {
  const containerName = container.Label;

  const retorno = {
    posicao: container.posicao,
    id: container.Id,
    label: container.Label,
    type: 'submenu',
    status: StatusService.getStatus(container.Status),
    submenu: [
      {
        label: 'Iniciar',
        type: 'radio',
        click: item => {
          runStopContainer(containerName, 'start');
        },
      },
      {
        label: 'Parar',
        type: 'radio',
        click: item => {
          runStopContainer(containerName, 'stop');
        },
      },
    ],
  };

  return retorno;
}

async function runStopContainer(containerName, command) {
  const container = spawn('docker', [command, containerName]);
  const valor = [];

  var retorno = new Promise(resp => {
    container.stdout.on('data', data => {
      valor.push(data.toString());
    });

    container.stdout.on('close', () => {
      resp(command);
    });
  });

  return retorno;
}

function noContainContainer() {
  return {
    posicao: 1,
    id: 1,
    label: 'Sem containers',
    type: 'normal',
    status: 'stop',
    click: item => {},
  };
}

module.exports = DockerContainer;
