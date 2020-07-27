import debounce from 'lodash.debounce/index';
import CloseIcon from './close.svg';
import './style.css';

export default class Modal
{
  constructor(element)
  {
    const self = this;

    this._isLightbox = false;

    this.modal = document.createElement('div');
    this.modal.classList.add('js-modal', 'hidden');

    this.wrapper = document.createElement('div');
    this.wrapper.classList.add('js-modal-wrapper');
    this.modal.appendChild(this.wrapper);

    let closeRenderer = document.createElement('template');
    closeRenderer.innerHTML = CloseIcon;
    let closeButton = closeRenderer.content.children[0];
    this.wrapper.appendChild(closeButton);

    this.content = document.createElement('div');
    this.content.classList.add('js-modal-content');
    this.wrapper.appendChild(this.content);

    if(element)
    {
      this.appendChild(element);
    }

    // Events

    let downTarget = null;
    this.modal.addEventListener('mousedown', function (e)
    {
      downTarget = e.target;
    });
    this.modal.addEventListener('mouseup', function (e)
    {
      if(downTarget === e.target)
      {
        if((e.target === closeButton)
          || (self._isLightbox && (e.target === self.modal)))
        {
          self.hide();
        }
      }
    });
    document.addEventListener('keyup', function (e)
    {
      if(e.key === 'Escape' || e.key === "Esc" || e.keyCode === 27)
      {
        self.hide();
      }
    });

    this.updatePosition();
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
      const debounceFn = _getDebounceFn(this);
      window.removeEventListener('resize', debounceFn);
      window.removeEventListener('orientationchange', debounceFn);
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
      const debounceFn = _getDebounceFn(this);
      window.addEventListener('resize', debounceFn);
      window.addEventListener('orientationchange', debounceFn);

      // show it
      this.modal.classList.remove('hidden');
    }
  }

  _postUpdateContent()
  {
    this.updatePosition();
  }

  updatePosition()
  {
    let maxHeight = Math.max(this.modal.clientHeight, window.innerHeight);
    this.wrapper.style.top = Math.max(0, (maxHeight / 3) - (this.wrapper.clientHeight / 2)) + 'px';
  }
}

const debounceMap = new Map();

function _getDebounceFn(modal)
{
  if(!debounceMap.has(modal))
  {
    debounceMap.set(modal, debounce(modal.updatePosition.bind(modal), 200, {'maxWait': 500}))
  }
  return debounceMap.get(modal);
}