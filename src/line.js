import Base from './base'
import Point from './point';
class Line extends Base {
  constructor(map, options = {}) {
    const defaultOptions = {
      category: 'line'
    }
    const _options = { ...defaultOptions,
      ...options
    }
    super(map, _options)
    this.featureIndex = 0
    // 顶点个数
    this.pointCount = 0
    // 添加图层
    this.addLayer()
  }

  draw(point) {
    let _feature = this.baseSource.data.features[this.featureIndex]
    if (!_feature) {
      // 设置数据源
      const feature = {
        type: 'Feature',
        id: this.featureIndex,
        geometry: {
          type: 'LineString',
          coordinates: []
        },
        properties: {
          index: this.featureIndex
        }
      }
      _feature = this.baseSource.data.features[this.featureIndex] = feature
    }
    if (!_feature.id) {
      this.baseSource.data.features[this.featureIndex].id = this.featureIndex
    }
    if (!_feature.properties) {
      this.baseSource.data.features[this.featureIndex].properties = {
        index: this.featureIndex
      }
    }
    // 设置data
    this.baseSource.data.features[this.featureIndex].geometry.coordinates.push([point.lng, point.lat])
    this.getSource().setData(this.baseSource.data)

    // 顶点数量加一
    this.pointCount++

    // 先移除事件
    this.removeEditEvent()
  }

  drawPoint(point) {
    if (!this.point) {
      this.point = new Point(this.map, {
        category: 'line'
      })
    }
    this.point.draw(point)
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
      type: 'line',
      paint: {
        'line-color': '#0094ff',
        'line-width': 2
      }
    })
  }

  /**
   * 初始化
   */
  init() {
    this._addMapEvent()
    // 顶点的个数
    this.pointCount = 0
  }

  setFeatureIndex(value) {
    this.featureIndex = value
  }

  mapEvent(e) {
    const point = e.lngLat
    this.draw(point)
    // 绘制点
    this.drawPoint(point)
  }

  editEvent(e) {
    // 获取到所有的点
    const features = e.features
    if (features.length <= 0) {
      return
    }
    const feature = features[0]
    console.log(this.getSource(feature.source)._data)

  }

  // 编辑line
  addEditFeature() {
    // 先移除事件
    this.removeEditEvent()

    this.tempEditEvent = this.editEvent.bind(this)
    this.map.on('click', this.layerId, this.tempEditEvent)

    this.tempMouseEnter = this.mouseEnter.bind(this)
    this.map.on('mouseenter', this.layerId, this.tempMouseEnter)

    this.tempMouseLeave = this.mouseLeave.bind(this)
    this.map.on('mouseleave', this.layerId, this.tempMouseLeave)
  }

  removeEditEvent() {
    this.map.off('click', this.layerId, this.tempEditEvent)
    this.map.off('mouseenter', this.layerId, this.tempMouseEnter)
    this.map.off('mouseleave', this.layerId, this.tempMouseLeave)
  }

  mouseEnter() {
    this.map.getCanvas().style.cursor = 'pointer'
  }

  mouseLeave() {
    this.map.getCanvas().style.cursor = ''
  }


  mousemove(point) {

    if (!this.baseSource.data.features[this.featureIndex]) {
      // 设置数据源
      const feature = {
        type: 'Feature',
        geometry: {
          type: 'LineString',
          coordinates: []
        }
      }
      this.baseSource.data.features[this.featureIndex] = feature
    }
    // 设置data
    const coors = this.baseSource.data.features[this.featureIndex].geometry.coordinates
    const len = coors.length
    if (len > 0) {
      coors[this.pointCount] = [point.lng, point.lat]
      this.getSource().setData(this.baseSource.data)
    }
  }

  /**
   * 鼠标移动事件
   * @param {事件源} e
   */
  mapMouseMoveEvent(e) {
    this.mousemove(e.lngLat)
  }

  mapMouseDownEvent(e) {
    // 如果是右键, 则取消当前操作
    if (e.originalEvent.button === 2) {
      this.cancel()
    }
  }

  finish() {
    super.finish(this._removeMapEvent)
    // 在结束的时候将feature加一是为了下次画的时候画新的一段, 并不是接着上一段继续画
    this.featureIndex++
    // 重置顶点数量
    this.pointCount = 0
    if (this.point) {
      this.point.finish()
    }
    // 清空点
    this.clearPoints()

    // 添加图层点击事件
    this.addEditFeature()
  }

  clearPoints() {
    this.point.baseSource.data.features = []
    this.point.getSource().setData(this.point.baseSource.data)
  }

  cancel() {
    super.cancel(() => {
      // 取消的时候移除事件
      this._removeMapEvent()
      // 移除已经画的点
      this.baseSource.data.features.pop()
      this.getSource().setData(this.baseSource.data)
      // 移除点
      this.point.baseSource.data.features = []
      this.point.getSource().setData(this.point.baseSource.data)
      // 重置poingCount
      this.resetPointCount()
    })
  }

  resetPointCount() {
    this.pointCount = 0
  }

  // 添加地图上的点击事件
  _addMapEvent() {
    // 先移除事件
    this._removeMapEvent()
    // 再添加事件
    this.tempMapEvent = this.mapEvent.bind(this)
    this.map.on('click', this.tempMapEvent)

    // 取消事件
    this.tempFinishEvent = this.finish.bind(this)
    this.map.on('dblclick', this.tempFinishEvent)

    // 鼠标移动事件
    this.tempMouseMoveEvent = this.mapMouseMoveEvent.bind(this)
    this.map.on('mousemove', this.tempMouseMoveEvent)

    this.tempMouseDown = this.mapMouseDownEvent.bind(this)
    this.map.on('mousedown', this.tempMouseDown)
  }

  _removeMapEvent() {
    this.map.off('click', this.tempMapEvent)
    this.map.off('dblclick', this.tempFinishEvent)
    this.map.off('mousemove', this.tempMouseMoveEvent)
    this.map.off('mousedown', this.tempMouseDown)
  }

}

export default Line