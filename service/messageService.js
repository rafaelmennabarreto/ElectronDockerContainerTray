const MessageService = {
  getMessageStatusContainer: (containerName, command) => {
    switch (command) {
      case 'start':
        return {
          title: 'Started',
          texto: `The container ${containerName} as started`,
        };
      case 'stop':
        return {
          title: 'Stopped',
          texto: `The container ${containerName} as Stopped`,
        };
    }
  },
};

module.exports = MessageService;
