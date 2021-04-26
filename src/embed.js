/**
 * @file Entry for embed.js
 */

import 'intersection-observer'
import mapboxgl from 'mapbox-gl'
import 'mapbox-gl/dist/mapbox-gl.css'
import './style.css'
import parseApiKey from './lib/parse-api-key'
import GeoloniaMap from './lib/geolonia-map'
import GeoloniaMarker from './lib/geolonia-marker'
import * as util from './lib/util'
import parseAtts from './lib/parse-atts'

if ( util.checkPermission() ) {
  let isDOMContentLoaded = false
  const alreadyRenderedMaps = []
  const plugins = []

  /**
   * render maps with .geolonia
   * @param {HTMLElement} target
   */
  const renderGeoloniaMap = target => {
    const map = new GeoloniaMap(target, { __allowGeoloniaClassName: true })

    // plugin
    const atts = parseAtts(target)
    if (isDOMContentLoaded) {
      plugins.forEach(plugin => plugin(map, target, atts))
    } else {
      alreadyRenderedMaps.push({ map, target: target, atts })
    }
  }

  document.addEventListener('DOMContentLoaded', () => {
    isDOMContentLoaded = true
    alreadyRenderedMaps.forEach(({ map, target, atts }) =>
      plugins.forEach(plugin => plugin(map, target, atts)),
    )
    // clear
    alreadyRenderedMaps.splice(0, alreadyRenderedMaps.length)
  })

  const observer = new IntersectionObserver(entries => {
    entries.forEach(item => {
      if (!item.isIntersecting) {
        return
      }
      renderGeoloniaMap(item.target)
      observer.unobserve(item.target)
    })
  })

  const containers = document.querySelectorAll('.geolonia[data-lazy-loading="off"]')
  const lazyContainers = document.querySelectorAll('.geolonia:not([data-lazy-loading="off"])')

  window.geolonia = mapboxgl
  const { key, stage } = parseApiKey(document)
  window.geolonia.accessToken = key
  window.geolonia.baseApiUrl = `https://api.geolonia.com/${stage}`
  window.geolonia.Map = GeoloniaMap
  window.geolonia.Marker = GeoloniaMarker
  window.geolonia.registerPlugin = plugin => {
    plugins.push(plugin)
    return void 0
  }

  window.mapboxgl = mapboxgl

  // render Map immediately
  for (let i = 0; i < containers.length; i++) {
    renderGeoloniaMap(containers[i])
  }

  // set intersection observer
  for (let i = 0; i < lazyContainers.length; i++) {
    observer.observe(lazyContainers[i])
  }
} else {
  console.error( '[Geolonia] We are very sorry, but we can\'t display our map in iframe.' ) // eslint-disable-line
}
