module.exports = {
  rollup(config, options) {
    // Force production build only
    config.plugins = config.plugins.map(plugin => {
      if (plugin.name === 'replace') {
        return {
          ...plugin,
          preventAssignment: true
        }
      }
      return plugin
    })
    
    return config
  },
}