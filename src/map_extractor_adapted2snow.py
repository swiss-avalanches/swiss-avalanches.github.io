import numpy as np
import argparse
import json
from pylab import contour
from PIL import ImageFilter, Image, ImageDraw
import cv2
from skimage import measure
import os
import json
import visvalingamwyatt as vw
import glob
import sys
from pathlib import Path


import pandas as pd
from scipy.spatial import distance

# colors definitions RGB alpha
black = np.array([0, 0, 0])
white = np.array([255, 255, 255])

light_blue = np.array([213, 252, 252])
light_medium_blue = np.array([168, 217, 241])
medium_blue = np.array([121, 161, 229])
dark_medium_blue = np.array([68, 89, 215]) #68 88 215
dark_blue = np.array([47, 36, 162])
purple = np.array([91, 32, 196])

color_code = ['#d5fcfc', '#a8d9f1', '#79a1e5', 
              '#4459d7', '#2f24a2', '#5b20c4']

raw_red = np.array([255, 0, 0])
raw_green = np.array([0, 255, 0])
raw_blue = np.array([0, 0, 255])
raw_pink = np.array([255, 0, 255])
raw_pink = np.array([255, 0, 255])
raw_cyan = np.array([0, 255, 255])
raw_yellow = np.array([255, 255, 0])

shades_blue = [light_blue, light_medium_blue, medium_blue, dark_medium_blue, dark_blue, purple]

shades_grey = [np.array([c,c,c]) for c in range(255)]

image_shades = [light_blue, light_medium_blue, medium_blue, dark_medium_blue, dark_blue, purple, white]

leman_west = (6.148131, 46.206042)
quatre_canton_north = (8.435177, 47.082150)
majeur_east = (8.856851, 46.151857)
east_end = (10.472221, 46.544303)
constance_nw = (9.035247, 47.812716)
jura = (6.879290, 47.352935)

landmarks_colors = {
    leman_west: raw_red,
    quatre_canton_north: raw_green,
    majeur_east: raw_blue,
    constance_nw: raw_pink,
    east_end: raw_yellow,
    jura: raw_cyan
}

SMOOTHING_THRESHOLD = 0.0001

def keep_colors(img, colors, replace_with=white):
    """return a new image with only the `colors` selected, other pixel are `replace_with`"""
    keep = np.zeros(img.shape[:2], dtype=bool)
    for c in colors:
        keep = keep | (c == img).all(axis=-1)
    new_img = img.copy()
    new_img[~keep] = replace_with
    return new_img

def remove_colors(img, colors, replace_with=white):
    """return a new image without the `colors` selected which will be replaced by `replace_with`"""
    keep = np.zeros(img.shape[:2], dtype=bool)
    for c in colors:
        keep = keep | (c == img).all(axis=-1)
    new_img = img.copy()
    new_img[keep] = replace_with
    return new_img

def replace_color(img, color_map):
    """return a new image replacing the image colors which will be mapped to their corresponding colors in `color_map` (df)"""
    new_img = img.copy()
    for _, (source, target) in color_map.iterrows():
        new_img[(img == source).all(axis=-1)] = target
    return new_img

def build_color_map(img_arr, image_shades = image_shades):
    """return colormap as dataframe"""
    im_df = pd.DataFrame([img_arr[i,j,:] for i,j in np.ndindex(img_arr.shape[0],img_arr.shape[1])])
    im_df = im_df.drop_duplicates()
    image_colors = im_df.as_matrix()
    
    colors = np.zeros(image_colors.shape)
    dist = distance.cdist(image_colors, image_shades, 'sqeuclidean')

    for j in range(dist.shape[0]):
        distances = dist[j,:]
        colors[j, :] = image_shades[distances.argmin()]
        
    color_map = pd.DataFrame(
        {'source': image_colors.tolist(),
         'target': colors.tolist()
        })
    
    return color_map


def numpify(o):
    if not isinstance(o, np.ndarray):
        o = np.array(o)
    return o


def coord_color(img, color):
    return np.array(list(zip(*(img == color).all(-1).nonzero())))

def open_mask(height, width):
    masks_path = args.masks_directory
    mask_name = '{}x{}.gif'.format(height, width)
    mask_path = os.path.join(masks_path, mask_name)
    mask = Image.open(mask_path)
    mask = mask.convert('RGB')
    mask = np.array(mask)

    landmarks_pix = {
        geo_point: (width, height)
        for geo_point, color in landmarks_colors.items()
        for height, width in coord_color(mask, color)
    }

    binary_mask = (mask != 255).any(-1)  # different of white
    return binary_mask, landmarks_pix

# remove contours areas that have more than 30% of white
WHITE_RATIO_THRESHOLD = .3

def color_contours(img, color):
    img = numpify(img)
    color = numpify(color)
    mask = (img == color[:3]).all(axis=-1)
    monocholor = img.copy()
    monocholor[~mask] = 255
    contours = measure.find_contours(mask, 0.5)
    
    # heuristic filter for contours
    filter_contours = []
    for c in contours:
        region = Image.new("L", [img.shape[1], img.shape[0]], 0)
        ImageDraw.Draw(region).polygon(list(map(lambda t: (t[1],t[0]), c)), fill=1)
        region = np.array(region).astype(bool)
        white_ratio = (monocholor == 255).all(axis=-1)[region].mean()
        if white_ratio <= WHITE_RATIO_THRESHOLD:
            filter_contours.append(c)
    return filter_contours
    
def main(args):

    for file_map in glob.glob(os.path.join(args.maps_directory, "*.gif")):
        filename = '{}.json'.format(os.path.splitext(os.path.basename(file_map))[0])
        destination = os.path.join(args.out_path, filename)
        
        if Path(destination).exists() and not args.f:
            print('Skip {} because {} already exists'.format(file_map, destination))
            continue

        img = Image.open(file_map)
        img = img.convert('RGB')
        img_arr = np.array(img)

        # load mask of this size
        try:
            binary_mask, landmarks_pix = open_mask(*img_arr.shape[:2])
        except FileNotFoundError:
            print('Missing mask "{}x{}.gif" for file "{}"'.format(*img_arr.shape[:2], file_map), file=sys.stderr)
            continue

        #remove grey colors
        nogrey_img_arr = remove_colors(img_arr, shades_grey)
        
        #build colormap
        color_map = build_color_map(nogrey_img_arr)
        
        #map image colors to registered shades 
        new_img_arr = replace_color(nogrey_img_arr, color_map=color_map)
        
        # keep useful colors
        regions_only = keep_colors(new_img_arr, shades_blue)

        # clip the binary mask to remove color key
        regions_only[~binary_mask] = 255
        regions_only = Image.fromarray(regions_only).convert('RGB')
        smoothed = regions_only.filter(ImageFilter.MedianFilter(7))

        pix = np.array(list(map(numpify, landmarks_pix.values())))
        coord = np.array(list(map(numpify, landmarks_pix.keys())))

        # add 1 bias raw
        pix_ext = np.vstack([np.ones((1,pix.shape[0])), pix.T])
        coord_ext = np.vstack([np.ones((1,pix.shape[0])), coord.T])

        T = np.linalg.lstsq(pix_ext.T, coord_ext.T)[0]

        def transform_pix2map(points):
            """n x 2 array"""
            points_ext = np.hstack([np.ones((points.shape[0], 1)), points])
            points_map = points_ext.dot(T)
            return points_map[:, 1:]

        geo_json = {
          "type": "FeatureCollection",
          "features": []
        }

        
        for snow_level, color in enumerate(shades_blue):
            for contour in color_contours(smoothed, color):
                contour_right = contour.copy()
                contour_right[:,0] = contour[:,1]
                contour_right[:,1] = contour[:,0]
                contour_right = transform_pix2map(contour_right)
                simplifier = vw.Simplifier(contour_right)
                contour_right = simplifier.simplify(threshold=SMOOTHING_THRESHOLD)
                geo_json['features'].append({
                    "type": "Feature",
                    "properties": {
                        "date": "TODO",
                        "snow_level": snow_level + 1
                    },
                    "geometry": {
                        "type": "Polygon",
                        "coordinates": [ list(reversed(contour_right.tolist())) ]
                    }
                })

        with open(destination, 'w') as f:
            print('{} -> {}'.format(file_map, destination))
            json.dump(geo_json, f)

            
if __name__ == '__main__':
    parser = argparse.ArgumentParser(description='Extract snow map to JSON.')
    parser.add_argument('maps_directory', type=str, help='directory of GIF file of the map')
    parser.add_argument('masks_directory', type=str, help='directory of GIF file of the mask')
    parser.add_argument('out_path', type=str, help='destination directory')
    parser.add_argument('-f', action='store_true', help='override existing JSON files')

    args = parser.parse_args()
    main(args)