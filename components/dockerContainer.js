const { spawn } = require('child_process');

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
    containersName.stdout.once('data', data => {
      const itensArray = data.toString().split('$%');
      var id = 0;

      itensArray.forEach(container => {
        if (container.trim().length > 1) {
          const item = JSON.parse(container);
          item.posicao = id++;
          containers.push(containerToItem(item));
        }
      });
      res(containers);
    });
  });

  return retorno;
}

function containerToItem(container) {
  console.log(container);

  return {
    posicao: container.posicao,
    id: container.Id,
    label: container.Label,
    type: 'normal',
    status: container.Status,
    click: item => {
      console.log(item.label);
    },
  };
}

module.exports = DockerContainer;
