const { app, Menu, Tray, Notification } = require('electron');
const DockerContainer = require('./components/dockerContainer');

let tray = null;

const itens = [
  {
    posicao: 9999,
    label: 'Fechar',
    type: 'normal',
    status: 'stoped',
    click: item => {
      app.quit();
    },
  },
];

app.on('ready', async () => {
  tray = new Tray('./assets/trayIcon/TrayIconTemplate.png');

  const containers = await DockerContainer.getRunningDockerContainers(tray);
  containers.forEach(item => {
    itens.push(item);
  });

  const contextMenu = Menu.buildFromTemplate(
    itens.sort((a, b) => a.posicao - b.posicao)
  );

  tray.setToolTip('Docker Tray Containers');
  tray.setContextMenu(contextMenu);
});
