import Point from './point'
import Line from './line'
import Polygon from './polygon'
class MapboxBetterDraw {
  constructor() {
    this.geometryTypes = [{
      type: 'point',
      text: '点'
    }, {
      type: 'line',
      text: '线'
    }, {
      type: 'polygon',
      text: '面'
    }, {
      type: 'cancel',
      text: '取消'
    }]
  }

  onAdd(map) {
    this.map = map
    const container = this._container = document.createElement('ul')
    container.className = 'mapboxgl-ctrl mapboxgl-better-draw'
    this.geometryTypes.forEach(item => {
      const li = document.createElement('li')
      li.className = 'mapboxgl-better-tool__li'
      li.textContent = item.text
      this._addEvent(item.type, li)
      container.appendChild(li)
    })
    return container
  }

  onRemove() {
    this._container.parentNode.removeChild(this._container);
    this.map = null;
  }

  // 画点的事件
  _pointEvent() {
    if (!this.point) {
      this.point = new Point(this.map)
    }
    this.point.init()
  }

  _lineEvent() {
    if (!this.line) {
      this.line = new Line(this.map)
    }
    this.line.init()
  }

  _polygonEvent() {
    if (!this.polygon) {
      this.polygon = new Polygon(this.map)
    }
    this.polygon.init()
  }

  _addEvent(type, dom) {
    // 先移除已有事件
    this._removeEvent(type, dom)
    if (type === 'point') {
      this.tempPointEvent = this._pointEvent.bind(this)
      dom.addEventListener('click', this.tempPointEvent, false)
    } else if (type === 'line') {
      this.tempLineEvent = this._lineEvent.bind(this)
      dom.addEventListener('click', this.tempLineEvent, false)
    } else if (type === 'polygon') {
      this.tempPolygonEvent = this._polygonEvent.bind(this)
      dom.addEventListener('click', this.tempPolygonEvent, false)
    }
  }

  _removeEvent(type, dom) {
    if (type === 'point') {
      dom.removeEventListener('click', this.tempPointEvent, false)
    } else if (type === 'line') {
      dom.removeEventListener('click', this.tempLineEvent, false)
    } else if (type === 'polygon') {
      dom.removeEventListener('click', this.tempPolygonEvent, false)
    }
  }
}

export default MapboxBetterDraw