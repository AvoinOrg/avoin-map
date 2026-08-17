export {}

declare global {
  namespace Chart {
    type ChartTooltipItem = {
      datasetIndex?: number
      yLabel?: number | string
    }

    type ChartDataSets = {
      label?: string
      data?: unknown
    }

    type ChartData = {
      datasets?: ChartDataSets[]
    }
  }

  interface Chart {
    data?: Chart.ChartData
    options: {
      tooltips?: {
        callbacks?: {
          label?: (
            tooltipItem: Chart.ChartTooltipItem,
            data: Chart.ChartData
          ) => string
        }
      }
    }
    update: () => void
  }
}
