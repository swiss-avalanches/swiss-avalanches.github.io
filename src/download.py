import argparse
import os
import requests
from multiprocessing import Pool

parser = argparse.ArgumentParser(description='Download files.')
parser.add_argument('urls', type=str, help='file containing urls to download')
parser.add_argument('destination', type=str, help='path to destination directory')
parser.add_argument('--prefix', type=str, help='url prefix to be removed', default='', required=False)
parser.add_argument('--nproc', type=int, help='url prefix to be removed', default=1, required=False)

args = parser.parse_args()

def create_dir(d):
    if not os.path.exists(d):
        os.makedirs(d)

def download(url, dest, prefix):
    path = url
    if path.startswith(prefix):
        path = path[len(prefix):]
    path = os.path.join(dest, path)

    if not os.path.exists(path):
        create_dir(os.path.dirname(path))
        content = requests.get(url).content
        with open(path, 'wb') as f:
            f.write(content)

    return path

def dl(u):
  return download(u, args.destination, args.prefix)

if __name__ == "__main__":
    with open(args.urls, 'r') as urls_file:
        urls = list(line.strip() for line in urls_file.readlines())

    print('start download {} files on {} proc(s)'.format(len(urls), args.nproc))

    with Pool(args.nproc) as pool:
        pool.map(dl, urls)

