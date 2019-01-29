import Base from './base'
import Point from './point';
import Line from './line'
class Polygon extends Base {
  constructor(map, options = {}) {
    const defaultOptions = {
      category: 'polygon',
      drawMode: 'polygon'
    }
    const _options = { ...defaultOptions,
      ...options
    }
    super(map, _options)
    this.options = _options
    this.featureIndex = 0
    // 顶点个数
    this.pointCount = 0
    this.startPoint = null
    // 添加图层
    this.addLayer()
  }

  draw(point) {
    if (!this.baseSource.data.features[this.featureIndex]) {
      // 设置数据源
      const feature = {
        type: 'Feature',
        geometry: {
          type: 'Polygon',
          coordinates: [
            []
          ]
        }
      }
      this.baseSource.data.features[this.featureIndex] = feature
    }

    const len = this.baseSource.data.features[this.featureIndex].geometry.coordinates[0].length
    const lngLat = [point.lng, point.lat]
    if (len === 0) {
      // 记录开始位置
      this.startPoint = point
      // 设置data
      this.baseSource.data.features[this.featureIndex].geometry.coordinates[0].push(lngLat)
      // 设置结束点
      this.baseSource.data.features[this.featureIndex].geometry.coordinates[0].push(lngLat)
    } else {
      // 在倒数第二个位置插入一个点
      this.baseSource.data.features[this.featureIndex].geometry.coordinates[0].splice(len - 1, 0, lngLat)
    }
    this.getSource().setData(this.baseSource.data)

    if (this.pointCount === 0) {
      this.pointCount = this.pointCount + 2
    } else {
      this.pointCount++
    }
  }

  drawPoint(point) {
    if (!this.point) {
      this.point = new Point(this.map, {
        category: 'polygon'
      })
    }
    this.point.draw(point)
  }

  drawLine(point) {
    if (!this.line) {
      this.line = new Line(this.map, {
        category: 'polygon'
      })
    }
    this.line.draw(point)
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
      type: 'fill',
      paint: {
        'fill-color': '#0094ff',
        'fill-opacity': 0.3
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

  mapEvent(e) {

    const point = e.lngLat
    this.draw(point)

    // 绘制线
    this.drawLine(point)

    // 绘制点
    this.drawPoint(point)
  }

  mousemove(point) {
    // 线移动事件
    this.line && this.line.mousemove(point)

    if (this.options.drawMode === 'polygon') {
      // 面重绘事件
      this.reDrawMove(point)
    }
  }

  // 重绘
  reDrawMove(point) {
    if (!this.baseSource.data.features[this.featureIndex]) {
      // 设置数据源
      const feature = {
        type: 'Feature',
        geometry: {
          type: 'Polygon',
          coordinates: [
            []
          ]
        }
      }
      this.baseSource.data.features[this.featureIndex] = feature
    }

    const firstCoor = this.baseSource.data.features[this.featureIndex].geometry.coordinates[0]

    const lastCoor = firstCoor.pop()
    const len = firstCoor.length
    const lngLat = [point.lng, point.lat]
    if (len > 0) {
      // this.pointCount记录的是所有的顶点数量, 为了固定位置, 需要先将最后一个删除, 然后在最后添加上
      firstCoor[this.pointCount - 1] = lngLat
      firstCoor.push(lastCoor)
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

  finish() {
    super.finish(this._removeMapEvent)
    // 在结束的时候将feature加一是为了下次画的时候画新的一段, 并不是接着上一段继续画
    this.featureIndex++
    // 这是画面, 当画面结束的时候需要在将线画到开始位置
    this.drawLine(this.startPoint)

    // 结束画线
    this.line.finish()
    // 设置下一个线的feature的索引
    this.line.setFeatureIndex(this.featureIndex)
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
  }

  _removeMapEvent() {
    this.map.off('click', this.tempMapEvent)
    this.map.off('dblclick', this.tempFinishEvent)
  }

}

export default Polygon