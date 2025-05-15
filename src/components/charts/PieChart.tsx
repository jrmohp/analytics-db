'use client';

import React from 'react';
import Chart from 'react-apexcharts';

interface PieChartProps {
  data: { label: string; value: number }[];
}

const PieChart: React.FC<PieChartProps> = ({ data }) => {
  const labels = data.map(d => d.label);
  const values = data.map(d => d.value);

  const chartOptions: ApexCharts.ApexOptions = {
    chart: {
      type: 'pie',
    },
    labels,
    legend: {
      position: 'bottom',
    },
    responsive: [{
      breakpoint: 480,
      options: {
        chart: { width: 300 },
        legend: { position: 'bottom' }
      }
    }],
    colors:  ['#FF922B', '#002677', '#F89F09', '#009CBD', '#00CFEA'],
  };

  return (
      <Chart
          options={chartOptions}
          series={values}
          type="pie"
          width="100%"
          height={300}
      />
  );
};

export default PieChart;
