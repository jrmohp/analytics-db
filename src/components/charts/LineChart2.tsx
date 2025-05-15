'use client';

import React from 'react';
import Chart from 'react-apexcharts';

interface LineChart2Props {
    categories: string[];
    series: {
        name: string;
        data: number[];
    }[];
}

const LineChart2: React.FC<LineChart2Props> = ({ categories, series }) => {
    const optumColors = ['#FF922B', '#FD7E14', '#F2B411', '#00B0B9', '#00CFEA'];

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

export default LineChart2;
