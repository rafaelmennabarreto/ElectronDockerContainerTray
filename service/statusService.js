const StatusService = {
  getStatus: texto => {
    texto = texto ? texto : '';

    if (texto.match('Up')) {
      return 'start';
    }

    if (texto.match('Exited')) {
      return 'stop';
    }
  },
};

module.exports = StatusService;
