import './style.css';

export default class Modal
{
  constructor()
  {
    const self = this;

    this._isLightbox = false;

    this.modal = document.createElement('div');
    this.modal.classList.add('js-modal', 'hidden');
    var downTarget = null;
    this.modal.addEventListener('mousedown', function (e)
    {
      downTarget = e.target;
    });
    this.modal.addEventListener('mouseup', function (e)
    {
      if((self._isLightbox) && (downTarget === self.modal) && (e.target === self.modal))
      {
        self.hide();
      }
    });
    document.addEventListener('keyup', function (e)
    {
      if(e.key === 'Escape' || e.key === "Esc" || e.keyCode === 27)
      {
        self.hide();
      }
    });

    this.content = document.createElement('div');
    this.content.classList.add('js-modal-content');
    this.modal.appendChild(this.content);

    this._updatePosition();
  }

  lightboxMode(value)
  {
    this._isLightbox = value;
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

  hide()
  {
    if(document.body.contains(this.modal))
    {
      document.body.removeChild(this.modal);
      this._postUpdateContent();
    }
  }

  show()
  {
    if(!document.body.contains(this.modal))
    {
      // add to document
      document.body.appendChild(this.modal);

      // calculate position
      this._postUpdateContent();
      window.addEventListener('resize', this._updatePosition.bind(this));

      // show it
      this.modal.classList.remove('hidden');
    }
  }

  _postUpdateContent()
  {
    this._updatePosition();
  }

  _updatePosition()
  {
    let maxHeight = Math.max(this.modal.clientHeight, window.innerHeight);
    this.content.style.top = ((maxHeight / 3) - (this.content.clientHeight / 2)) + 'px';
  }
}
