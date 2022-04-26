import React, { useRef, useEffect, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import * as turf from '@turf/turf'

import "../styles/Mapbox.css";

mapboxgl.accessToken = 'pk.eyJ1IjoiZmFrZXVzZXJnaXRodWIiLCJhIjoiY2pwOGlneGI4MDNnaDN1c2J0eW5zb2ZiNyJ9.mALv0tCpbYUPtzT7YysA2g';

function Mapbox() {
    const mapContainer = useRef(null);
    const map = useRef(null);
    const [lng, setLng] = useState(-82.6595); // eslint-disable-line no-unused-vars
    const [lat, setLat] = useState(9.6287); // eslint-disable-line no-unused-vars
    const [zoom, setZoom] = useState(17); // eslint-disable-line no-unused-vars
    const [flag, setFlag] = useState(false); // eslint-disable-line no-unused-vars

    useEffect(() => {
        if (map.current) return;
        map.current = new mapboxgl.Map({
            container: mapContainer.current,
            style: 'mapbox://styles/mapbox/satellite-v9',
            center: [lng, lat],
            zoom: zoom,
            scrollZoom: true
        });

        // const bounds = map.current.getBounds();
        // console.log(`bounds:`, bounds);

        // const NE = bounds.getNorthEast();
        // const SW = bounds.getSouthWest();

        var grid;
        // var cellSide = 0.01;
        // var grid = turf.squareGrid([SW.lng, SW.lat, NE.lng, NE.lat], cellSide, 'kilometers');
        // console.log(`squareGrid - before:`, grid);

        // // Set all features to highlighted == 'No'
        // for (let i = 0; i < grid.features.length; i++) {
        //     grid.features[i].properties.highlighted = 'No';
        //     grid.features[i].properties.id = i;
        // }
        // console.log(`squareGrid - after:`, grid);

        map.current.on('load', () => {
            console.log(`-- Loaded --`);

            // map.current.addSource('grid-source', {
            //     'type': "geojson",
            //     'data': grid,
            //     'generateId': true
            // });

            // map.current.addLayer(
            //     {
            //         'id': 'grid-layer',
            //         'type': 'fill',
            //         'source': 'grid-source',
            //         'paint': {
            //             'fill-outline-color': 'rgba(0,0,0,0.1)',
            //             'fill-color': 'rgba(0,0,0,0.1)'
            //         }
            //     }
            // );

            // map.current.addLayer(
            //     {
            //         'id': 'grid-layer-highlighted',
            //         'type': 'fill',
            //         'source': 'grid-source',
            //         'paint': {
            //             'fill-outline-color': '#484896',
            //             'fill-color': '#6e599f',
            //             'fill-opacity': 0.75
            //         },
            //         //'filter': ['==', ['get', 'highlighted'], 'Yes']
            //         'filter': ['==', ['get', 'id'], -1]
            //     }
            // );

            const drawGrid = () => {
                const bounds = map.current.getBounds();
                console.log(`re bounds:`, bounds);

                const NE = bounds.getNorthEast();
                const SW = bounds.getSouthWest();

                const sLng = Math.floor(SW.lng * 1000) / 1000;
                const sLat = Math.floor(SW.lat * 1000) / 1000;
                const eLng = Math.ceil(NE.lng * 1000) / 1000;
                const eLat = Math.ceil(NE.lat * 1000) / 1000;

                console.log(sLng, sLat, eLng, eLat);

                const cellSide = 0.0001;
                grid = turf.squareGrid([sLng, sLat, eLng, eLat], cellSide, { units: 'degrees' });
                console.log(grid);

                if (map.current.getSource('grid-source')) {
                    map.current.getSource('grid-source').setData(grid);
                } else {
                    map.current.addSource('grid-source', {
                        'type': "geojson",
                        'data': grid,
                        'generateId': true
                    });

                    map.current.addLayer(
                        {
                            'id': 'grid-layer',
                            'type': 'fill',
                            'source': 'grid-source',
                            'paint': {
                                'fill-outline-color': 'rgba(0,0,0,0.2)',
                                'fill-color': 'rgba(0,0,0,0.0)'
                            }
                        }
                    );
                    // map.current.addLayer(
                    //     {
                    //         'id': 'grid-layer-highlighted',
                    //         'type': 'fill',
                    //         'source': 'grid-source',
                    //         'paint': {
                    //             'fill-outline-color': '#484896',
                    //             'fill-color': '#6e599f',
                    //             'fill-opacity': 0.3
                    //         },
                    //         //'filter': ['==', ['get', 'highlighted'], 'Yes']
                    //         'filter': ['==', ['get', 'id'], -1]
                    //     }
                    // );
                }
            };

            drawGrid();

            //click action
            map.current.on('click', 'grid-layer', function (e) {
                // map.current.on('zoomend', function (e) {
                var selectIndex = e.features[0].id;
                grid.features[e.features[0].id].properties.highlighted = 'Yes';
                console.log(`highlighted before:`, e.features[0].properties.highlighted);
                e.features[0].properties.highlighted = 'Yes';
                console.log(`feature:`, e.features[0]);
                console.log(`selectIndex:`, selectIndex);
                console.log(`highlighted after:`, e.features[0].properties.highlighted);
                const filter = ['==', ['number', ['get', 'id']], selectIndex];
                map.current.setFilter('grid-layer-highlighted', filter);

                // drawGrid();
                console.log('------');
            });

            map.current.on('moveend', function (e) {
                drawGrid();
                // console.log('<<<<<');
            })
        });

        // Clean up on unmount
        return () => map.current.remove();
    });

    return (
        <div>
            <div className="sidebar">
                Longitude: {lng} | Latitude: {lat} | Zoom: {zoom} | click : {flag == true}
            </div>
            <div ref={mapContainer} className="map-container" />
        </div>
    );
}

export default Mapbox;