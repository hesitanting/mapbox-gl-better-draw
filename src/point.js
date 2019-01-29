import Base from './base'
class Point extends Base {
  constructor(map, options = {}) {
    const defaultOptions = {
      category: 'point'
    }
    const _options = {...defaultOptions, ...options}
    super(map, _options)
    // 添加图层
    this.addLayer()
  }

  draw(point) {
    // 设置数据源
    const feature = {
      type: 'Feature',
      geometry: {
        type: 'Point',
        coordinates: [point.lng, point.lat]
      }
    }
    // 设置data
    this.baseSource.data.features.push(feature)
    this.getSource().setData(this.baseSource.data)
  }

  addSource() {
    if (this.getSource(this.sourceId)) {
      return this.sourceId
    }
    this.map.addSource(this.sourceId, this.baseSource)
    return this.sourceId
  }

  addLayer() {
    // 1. 添加图层前先添加数据源
    const sourceId = this.addSource()

    // 2. 添加图层
    if (this.getLayer(this.layerId)) {
      return
    }
    this.map.addLayer({
      id: this.layerId,
      source: sourceId,
      type: 'circle',
      paint: {
        'circle-color': '#ff0000',
        'circle-radius': 5
      }
    })
  }

  // 初始化
  init() {
    this._addMapEvent()
  }

  mapEvent(e) {
    this.draw(e.lngLat)
    this.finish()
  }

  finish() {
    super.finish(this._removeMapEvent)
  }

  // 添加地图上的点击事件
  _addMapEvent() {
    this._removeMapEvent()

    this.tempMapEvent = this.mapEvent.bind(this)
    this.map.on('click', this.tempMapEvent)
  }

  _removeMapEvent() {
    this.map.off('click', this.tempMapEvent)
  }

}

export default Point
