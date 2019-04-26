import './style.css';

export default class Modal
{
  constructor()
  {
    const self = this;

    this.modal = document.createElement('div');
    this.modal.classList.add('js-modal', 'hidden');
    var downTarget = null;
    this.modal.addEventListener('mousedown', function (e)
    {
      downTarget = e.target;
    });
    this.modal.addEventListener('mouseup', function (e)
    {
      if((downTarget === self.modal) && (e.target === self.modal))
      {
        self.remove();
      }
    });

    this.content = document.createElement('div');
    this.content.classList.add('js-modal-content');
    this.modal.appendChild(this.content);

    this._updatePosition();
  }

  appendChild(newChild)
  {
    this.content.appendChild(newChild);
    this._postUpdateContent();
  }

  clear()
  {
    while(this.content.firstChild)
    {
      this.content.removeChild(this.content.firstChild);
    }
    this._postUpdateContent();
  }

  remove()
  {
    document.body.removeChild(this.modal);
    this._postUpdateContent();
  }

  show()
  {
    // add to document
    document.body.appendChild(this.modal);

    // calculate position
    this._postUpdateContent();
    window.addEventListener('resize', this._debounceUpdatePosition.bind(this));

    // show it
    this.modal.classList.remove('hidden');
  }

  _postUpdateContent()
  {
    this._debounceUpdatePosition();
  }

  _debounceUpdatePosition()
  {
    // debounce position update
    if(this._posDebounce)
    {
      clearTimeout(this._posDebounce);
    }
    this._posDebounce = setTimeout(this._updatePosition.bind(this), 100)
  }

  _updatePosition()
  {
    let maxHeight = Math.max(this.modal.clientHeight, window.innerHeight);
    this.content.style.top = ((maxHeight / 3) - (this.content.clientHeight / 2)) + 'px';
  }
}
