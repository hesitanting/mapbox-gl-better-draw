const geometryObj = {
  point: {
    sourceId: 'SOURCE_POINT_ID',
    layerId: 'LAYER_POINT_ID'
  },
  line: {
    sourceId: 'SOURCE_LINE_ID',
    layerId: 'LAYER_LINE_ID',
    pointSourceId: 'SOURCE_LINE_POINT_ID',
    pointLayerId: 'LAYER_LINE_POINT_ID',
  },
  polygon: {
    sourceId: 'SOURCE_POLYGON_ID',
    layerId: 'LAYER_POLYGON_ID',
    pointSourceId: 'SOURCE_POLYGON_POINT_ID',
    pointLayerId: 'LAYER_POLYGON_POINT_ID',
    lineSourceId: 'SOURCE_POLYGON_LINE_ID',
    lineLayerId: 'LAYER_POLYGON_LINE_ID',
  }
}
class Base {
  constructor(map, options = {}) {
    const defaultOptions = {
      category: 'point'
    }
    this.options = Object.assign({}, defaultOptions, options)
    this.map = map
    this.baseSource = {
      type: 'geojson',
      data: {
        type: 'FeatureCollection',
        features: []
      }
    }
    this.sourceId = ''
    this.layerId = ''
    // 根据实例, 初始化sourceId和layerId
    const { category } = this.options
    // 获取构造函数名称
    const { name } = this.constructor
    if (category === 'point') {
      // 点的数据源和图层id
      this.sourceId = geometryObj[category].sourceId
      this.layerId = geometryObj[category].layerId
    } else if (category === 'line') {
      if (name === 'Line') {
        // 线的数据源和id
        this.sourceId = geometryObj[category].sourceId
        this.layerId = geometryObj[category].layerId
      } else if (name === 'Point') {
        // 线上点的数据源和id
        this.sourceId = geometryObj[category].pointSourceId
        this.layerId = geometryObj[category].pointLayerId
      }
    } else if (category === 'polygon') {
      if (name === 'Polygon') {
        // 线的数据源和id
        this.sourceId = geometryObj[category].sourceId
        this.layerId = geometryObj[category].layerId
      } else if (name === 'Point') {
        // 线上点的数据源和id
        this.sourceId = geometryObj[category].pointSourceId
        this.layerId = geometryObj[category].pointLayerId
      } else if (name === 'Line') {
        // 线上面的数据源和id
        this.sourceId = geometryObj[category].lineSourceId
        this.layerId = geometryObj[category].lineLayerId
      }
    }
  }

  getSource(sourceId) {
    return this.map.getSource(sourceId || this.sourceId)
  }

  getLayer(layerId) {
    return this.map.getLayer(layerId || this.layerId)
  }

  finish(cb) {
    cb.call(this)
  }

  cancel(cb) {
    cb.call(this)
  }
}

export default Base
