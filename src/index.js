import debounce from 'lodash.debounce/index';
import './style.css';

const _modalContainer = document.createElement('div');
_modalContainer.classList.add('modal__container');

const _modalHidden = document.createElement('div');
_modalHidden.classList.add('modal__hidden');
_modalContainer.appendChild(_modalHidden);

const _modalShown = document.createElement('div');
_modalShown.classList.add('modal__shown');
_modalContainer.appendChild(_modalShown);

const _eleMap = new Map();
const _idMap = new Map();

export class Modal
{
  static create(element)
  {
    if(element instanceof Modal)
    {
      return element;
    }

    if(!_eleMap.has(element))
    {
      const modal = new this.prototype.constructor(...arguments);
      _eleMap.set(element, modal);
      if(element.hasAttribute('id'))
      {
        _idMap.set(element.getAttribute('id'), modal);
      }
    }
    return _eleMap.get(element);
  }

  static has(element)
  {
    return _eleMap.has(element);
  }

  static hide(element)
  {
    let p = element;
    do
    {
      if(Modal.has(p))
      {
        Modal.create(p).hide();
        return true;
      }
    }
    while((p = p.parentNode));
  }

  static remove(element)
  {
    let p = element;
    do
    {
      if(Modal.has(p))
      {
        Modal.create(p).remove();
        return true;
      }
    }
    while((p = p.parentNode));
  }

  constructor(element)
  {
    this.modal = document.createElement('div');
    this.modal.classList.add('modal');

    this.wrapper = document.createElement('div');
    this.wrapper.classList.add('modal__wrapper');
    this.modal.appendChild(this.wrapper);

    if(element.matches('.modal__content'))
    {
      this.content = element;
    }
    else
    {
      this.content = document.createElement('div');
      this.content.classList.add('modal__content');
      this.content.appendChild(element);
    }

    this.wrapper.appendChild(this.content);

    if(element.hasAttribute('id'))
    {
      this.modal.setAttribute('id', element.getAttribute('id') + '--outer');
    }

    if(element.hasAttribute('modal-class'))
    {
      this.modal.classList.add(element.getAttribute('modal-class'));
    }

    if(element.style.display === 'none')
    {
      element.style.removeProperty('display');
    }

    _modalHidden.appendChild(this.modal)
  }

  appendChild(newChild)
  {
    this.content.appendChild(newChild);
    this._postUpdateContent();
    return this;
  }

  clear()
  {
    while(this.content.firstChild)
    {
      this.content.removeChild(this.content.firstChild);
    }
    this._postUpdateContent();
    return this;
  }

  hide()
  {
    if(
      (_modalShown.contains(this.modal))
      && this.modal.dispatchEvent(_getEvent('modal-hide', this.modal, true))
    )
    {
      this.modal.classList.remove('hidden');
      _modalHidden.appendChild(this.modal)
      this._removeEvents();
      document.dispatchEvent(_getEvent('modal-hidden', this.modal));
    }
    return this;
  }

  remove()
  {
    this.modal.parentElement.removeChild(this.modal);
    this._removeEvents();
    document.dispatchEvent(_getEvent('modal-removed', this.modal));
    return this;
  }

  show()
  {
    if(
      (!_modalShown.contains(this.modal))
      && document.dispatchEvent(_getEvent('modal-show', this.modal, true))
    )
    {
      // add to document
      _modalShown.appendChild(this.modal)
      if(!document.body.contains(_modalContainer))
      {
        document.body.appendChild(_modalContainer);
      }

      // calculate position
      this._postUpdateContent();
      this._addEvents();

      // show it
      this.modal.classList.remove('hidden');
      this.modal.dispatchEvent(_getEvent('modal-shown', this.modal));
    }
    return this;
  }

  _postUpdateContent()
  {
    // find children with an id, check to see if they are modal contents, or targets of modal-launcher or modal-closer
    this.content.querySelectorAll('[id]').forEach(
      i =>
      {
        const id = i.getAttribute('id');
        if(i.matches('.modal__content') || (document.querySelectorAll(`[modal-launcher="${id}"], [modal-closer="${id}"]`).length > 0))
        {
          Modal.create(i);
        }
      });

    this.updatePosition();
  }

  updatePosition()
  {
    const modalStyle = getComputedStyle(this.modal);
    const modalPadding = parseInt(modalStyle.paddingTop) + parseInt(modalStyle.paddingBottom) || 0;

    // modal.clientHeight is the total height excluding the page scrollbar
    // wrapper.offsetHeight is the height of the modal content including any scrollbar
    const surplus = Math.max(0, this.modal.clientHeight - this.wrapper.offsetHeight - modalPadding);

    this.wrapper.style.top = (surplus / 3) + 'px';
    return this;
  }

  _addEvents()
  {
    this._removeEvents();

    const debounceFn = _getDebounceFn(this);
    window.addEventListener('resize', debounceFn);
    window.addEventListener('orientationchange', debounceFn);
    return this;
  }

  _removeEvents()
  {
    const debounceFn = _getDebounceFn(this);
    window.removeEventListener('resize', debounceFn);
    window.removeEventListener('orientationchange', debounceFn);
    return this;
  }
}

const _debounceMap = new Map();

function _getDebounceFn(modal)
{
  if(!_debounceMap.has(modal))
  {
    _debounceMap.set(modal, debounce(modal.updatePosition.bind(modal), 200, {'maxWait': 500}))
  }
  return _debounceMap.get(modal);
}

function _getEvent(eventName, modal, cancelable = false)
{
  return new CustomEvent(eventName, {detail: {modal}, cancelable: cancelable, bubbles: true, composed: true});
}

export function init()
{
  document.addEventListener(
    'click', (e) =>
    {
      const closer = e.target.closest('[modal-closer]');
      if(closer)
      {
        e.preventDefault();
        Modal.hide(e.target);
      }

      const launcher = e.target.closest('[modal-launcher]');
      if(launcher)
      {
        e.preventDefault();
        const modalId = launcher.getAttribute('modal-launcher');
        const modalEle = document.getElementById(modalId) || _idMap.get(modalId);
        if(!modalEle)
        {
          console.error('No modal could be found with the id ' + launcher.getAttribute('modal-launcher'));
          return;
        }

        Modal.create(modalEle).show();
      }
    },
  );

  document.addEventListener(
    'keyup', e =>
    {
      if(e.key === 'Escape' || e.key === 'Esc' || e.keyCode === 27)
      {
        // find the last modal's closer
        const closer = document.querySelector('.modal:last-of-type .modal__content [modal-closer]');
        if(closer)
        {
          e.preventDefault();
          Modal.hide(closer);
        }
      }
    },
  );
}
