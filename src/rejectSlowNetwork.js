const networkError = 'feedback.networkError';

const rejectSlowNetwork = (networkTimeout) => new Promise(
  (_resolve, reject) => {
    setTimeout(() => {
      reject(new Error(networkError));
    }, networkTimeout);
  },
);

export default rejectSlowNetwork;
