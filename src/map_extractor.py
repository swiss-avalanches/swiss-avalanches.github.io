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

# colors definitions RGB alpha
black = np.array([0, 0, 0])
white = np.array([255, 255, 255])

green = np.array([204, 255, 102])
yellow = np.array([255, 255, 0])
orange = np.array([255, 153, 0])
red = np.array([255, 0, 0])

raw_red = np.array([255, 0, 0])
raw_green = np.array([0, 255, 0])
raw_blue = np.array([0, 0, 255])
raw_pink = np.array([255, 0, 255])
raw_pink = np.array([255, 0, 255])
raw_cyan = np.array([0, 255, 255])
raw_yellow = np.array([255, 255, 0])

leman_west = (6.148131, 46.206042)
quatre_canton_north = (8.435177, 47.082150)
majeur_east = (8.856851, 46.151857)
east_end = (10.472221, 46.544303)
constance_nw = (9.035247, 47.812716)

landmarks_colors = {
    leman_west: raw_red,
    quatre_canton_north: raw_green,
    majeur_east: raw_blue,
    constance_nw: raw_pink,
    east_end: raw_yellow,
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

        # keep useful colors
        regions_only = keep_colors(img_arr, [green, yellow, orange, red])

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

        for danger_level, color in enumerate([green, yellow, orange, red]):
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
                        "danger_level": danger_level + 1
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
    parser = argparse.ArgumentParser(description='Extract danger map to JSON.')
    parser.add_argument('maps_directory', type=str, help='directory of GIF file of the map')
    parser.add_argument('masks_directory', type=str, help='directory of GIF file of the mask')
    parser.add_argument('out_path', type=str, help='destination directory')
    parser.add_argument('-f', action='store_true', help='override existing JSON files')

    args = parser.parse_args()
    main(args)