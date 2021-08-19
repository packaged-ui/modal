import Modal from '../src/modal.js';

export {Modal};

document.querySelector('#remove-btn').addEventListener('click', () =>
{
  Modal.remove(document.querySelector('#my-modal'));
});
