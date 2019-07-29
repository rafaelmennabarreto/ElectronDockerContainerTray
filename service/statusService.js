const StatusService = {
  getStatus: texto => {
    texto = texto ? texto : '';

    if (texto.match('Up')) {
      return 'start';
    }

    return 'stop';
  },
};

module.exports = StatusService;
