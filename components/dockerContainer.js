const { spawn } = require('child_process');
const StatusService = require('../service/statusService');
const NotificationService = require('../service/notificationService');

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
  const started = StatusService.getStatus(container.Status) === 'start';

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
        checked: started,
        click: async item => {
          const comando = 'start';
          await runStopContainer(containerName, comando);
          verifyContainerIsRunning(containerName, comando);
        },
      },
      {
        label: 'Parar',
        type: 'radio',
        checked: !started,
        click: async item => {
          const comando = 'stop';
          await runStopContainer(containerName, comando);
          verifyContainerIsRunning(containerName, comando);
        },
      },
    ],
  };

  return retorno;
}

async function verifyContainerIsRunning(containerName, command) {
  const result = spawn('docker', [
    'ps',
    '--filter',
    `Name=${containerName}`,
    '--format',
    '"{{.Names}}"',
  ]);

  const retorno = new Promise(resp => {
    const containerReturnName = [];

    result.stdout.on('data', data => {
      containerReturnName.push(data.toString());
    });

    result.stdout.on('close', item => {
      const messageItem = getContainerMessage(containerName, command);
      NotificationService.sendNotification(
        messageItem.title,
        messageItem.texto
      );
    });

    result.stdout.on('error', item => {
      console.log('erro');
    });
  });

  return retorno;
}

async function runStopContainer(containerName, command) {
  const container = spawn('docker', [command, containerName]);
  const valor = [];

  const retorno = new Promise(resp => {
    container.stdout.on('data', data => {
      valor.push(data.toString());
    });

    container.stdout.on('close', async () => {
      resp(command);
    });
  });

  return retorno;
}

function getContainerMessage(containerName, command) {
  const messageItem = MessageService.getMessageStatusContainer(
    containerName,
    command
  );

  if (command === 'start') {
    const title = containerReturnName.length > 0 ? messageItem.title : 'Error';

    const message =
      containerReturnName.length > 0
        ? messageItem.text
        : 'Error starting docker container';
  } else {
    const title =
      containerReturnName.length === 0 ? messageItem.title : 'Error';

    const message =
      containerReturnName.length === 0
        ? messageItem.text
        : 'Error stopping docker container';
  }

  return { title: title, texto: message };
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
