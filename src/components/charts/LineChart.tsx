'use client';

import React from 'react';
import Chart from 'react-apexcharts';

interface LineChartProps {
  data: { [key: string]: any }[];
  xKey: string;
  yKeys: string[];
}

const LineChart: React.FC<LineChartProps> = ({ data, xKey, yKeys }) => {
  const categories = data.map((item) => item[xKey]);

  const series = yKeys.map((key) => ({
    name: key,
    data: data.map((item) => item[key]),
  }));

  // Optum-aligned brand colors for contrast
  const optumColors = ['#FF922B', '#002677', '#F89F09', '#009CBD', '#00CFEA'];

  const options: ApexCharts.ApexOptions = {
    chart: {
      type: 'line',
      toolbar: { show: false },
      zoom: { enabled: false },
    },
    stroke: {
      curve: 'smooth',
      width: 2,
    },
    xaxis: {
      categories,
    },
    dataLabels: {
      enabled: false,
    },
    legend: {
      position: 'top',
    },
    tooltip: {
      enabled: true,
    },
    colors: optumColors,
    markers: {
      size: 4,
      hover: {
        sizeOffset: 2,
      },
    },
  };

  return (
      <Chart
          options={options}
          series={series}
          type="line"
          height={350}
      />
  );
};

export default LineChart;
