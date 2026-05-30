import { useState, useMemo } from 'react'

export function useSortedData(data = [], defaultKey = 'healthScore', defaultDir = 'desc') {
  const [cfg, setCfg] = useState({ key: defaultKey, dir: defaultDir })

  const onSort = key =>
    setCfg(prev => ({ key, dir: prev.key === key && prev.dir === 'desc' ? 'asc' : 'desc' }))

  const sorted = useMemo(() => {
    if (!data.length) return []
    return [...data].sort((a, b) => {
      let va = a[cfg.key] ?? '', vb = b[cfg.key] ?? ''
      // Handle arrays (e.g. repos, orgs)
      if (Array.isArray(va)) va = va.length
      if (Array.isArray(vb)) vb = vb.length
      const cmp = typeof va === 'string' ? va.localeCompare(vb) : Number(va) - Number(vb)
      return cfg.dir === 'asc' ? cmp : -cmp
    })
  }, [data, cfg.key, cfg.dir])

  return { sorted, sortConfig: cfg, onSort }
}
