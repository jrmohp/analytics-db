'use client';

import React from 'react';
import Chart from 'react-apexcharts';

interface BarChartProps {
    data: { [key: string]: any }[];
    xKey: string;
    yKeys: string[];
}

const BarChart: React.FC<BarChartProps> = ({ data, xKey, yKeys }) => {
    const categories = data.map((item) => item[xKey]);

    const series = yKeys.map((key) => ({
        name: key,
        data: data.map((item) => item[key]),
    }));

    // Optum brand colors for contrast
    const optumColors = ['#FF922B', '#002677', '#F89F09', '#009CBD', '#00CFEA'];

    const options: ApexCharts.ApexOptions = {
        chart: {
            type: 'bar',
            toolbar: { show: false },
        },
        xaxis: {
            categories,
        },
        plotOptions: {
            bar: {
                horizontal: false,
                columnWidth: '55%',
            },
        },
        dataLabels: {
            enabled: false,
        },
        stroke: {
            show: true,
            width: 2,
            colors: ['transparent'],
        },
        legend: {
            position: 'top',
        },
        fill: {
            opacity: 1,
            colors: optumColors,
        },
        colors: optumColors,
    };

    return (
        <Chart
            options={options}
            series={series}
            type="bar"
            height={350}
        />
    );
};

export default BarChart;
