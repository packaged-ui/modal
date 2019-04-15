import './style.css';

export default class Modal
{
  constructor()
  {
    this.modal = document.createElement('div');
    this.modal.addEventListener('click', this.remove.bind(this));
    this.modal.classList.add('js-modal', 'hidden');

    this.content = document.createElement('div');
    this.content.classList.add('js-modal-content');
    this.content.addEventListener('click', function (e) {e.stopImmediatePropagation();});
    this.modal.appendChild(this.content);
  }

  appendChild(newChild)
  {
    this.content.appendChild(newChild);
    this._debounceUpdatePosition();
  }

  clear()
  {
    while(this.content.firstChild)
    {
      this.content.removeChild(this.content.firstChild);
    }
    this._debounceUpdatePosition();
  }

  remove()
  {
    document.body.removeChild(this.modal);
  }

  show()
  {
    // add to document
    document.body.appendChild(this.modal);

    // calculate position
    this._updatePosition();
    window.addEventListener('resize', this._debounceUpdatePosition.bind(this));

    // show it
    this.modal.classList.remove('hidden');
  }

  _debounceUpdatePosition()
  {
    if(this._posDebounce)
    {
      clearTimeout(this._posDebounce);
    }
    this._posDebounce = setTimeout(this._updatePosition.bind(this), 50)
  }

  _updatePosition()
  {
    this.content.style.top = ((this.modal.clientHeight / 3) - (this.content.clientHeight / 2)) + 'px';
  }
}
