from pytube import YouTube
from time import time
def aa () :
    t = time()
    YouTube("/P1InbqTm4pE").streams.filter(only_audio=True).first().download()
    print(time() - t)

aa()
