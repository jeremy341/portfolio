# MIRA

- Original content ID: mira
- Category: Machine learning
- Status: Experiment
- Technologies and topics: Computer vision, Python, YOLO, ONNX

## Summary

I taught a camera to recognize waste, from a small classifier to YOLO detection. A great validation score didn't always mean a great real-world model.

## Story

So, at one point I got MIRA to about **90.6% mAP50** on its validation set. I was thrilled. After all those experiments, seeing that number on the screen felt amazing.

Then I tried the models on less controlled, real-life images.

Yeah. Not quite as amazing.

To my eyes, the newer model wasn't consistently doing as well as my older EXP-014 model. That was frustrating, because the validation score was supposed to mean the training was going in the right direction. But it made me question what I was actually measuring.

And honestly, that question became more interesting than the number itself.

### How it started: one camera, a bit of waste, and a question

MIRA stands for **Machine Intelligence for Recycling Automation**. The long-term goal is automatic waste sorting. The less glamorous short-term goal is getting a computer to recognize the materials in front of a camera reliably.

I began with 796 photos in four classes. First I built a small convolutional neural network (CNN) to learn the basics. Then I fine-tuned MobileNetV2, which reached around 87% validation accuracy. I even converted that classifier into a 2.6 MB INT8 TFLite model.

Pretty nice for something small. But it had a problem.

A **classifier** returns a label for an entire image. It can tell you the photo looks like plastic. A machine sorting a pile of objects needs **detection**: what objects are there, where are they, and how many?

So MIRA went from classification to object detection. I tried YOLOv8n, then YOLO11n, with five labels: glass, metal, paper, plastic and trash.

### I thought more training data would automatically help

This is where things started getting messy.

The dataset came from several places, including [TACO](https://tacodataset.org/), [TrashNet](https://github.com/garythung/trashnet), [Roboflow](https://roboflow.com/) data and a dataset by dmedhi. I had to reconcile different image styles, backgrounds and annotations. Some photos look like carefully arranged objects on a table. Others look much more like actual litter.

I originally expected that throwing more data at the model would make it smarter. Turns out that's not how it works.

I tested combinations, dropped the WaRP source after it worsened results, and rebuilt a class-balanced dataset with a fixed random seed and SHA-256 deduplication. That last part matters: a dataset isn't trustworthy if near-identical files accidentally appear in both training and evaluation.

The rebuilt set has **6,898 images and 12,832 bounding boxes**, with 5,108 training images, 415 validation images and 1,375 reserved for testing. The validation split is comparatively clean and tabletop-like, which will become important in a second.

{{figure:1}}

That graph shows how much the recorded per-class validation metrics changed after rebuilding the data. It's a dramatic improvement on *that evaluation setup*. It isn't evidence that every material became just as easy to detect in real conditions.

### EXP-014 versus EXP-019: two different kinds of good

EXP-014 was trained on an older dataset mix, including more varied backgrounds. Its recorded validation result was **60.7% mAP50**.

EXP-018 and EXP-019 used the cleaner, balanced data. They got approximately **90.6% mAP50** on the 415-image validation split, and the repeat came out almost the same.

At first glance you'd think that settles it. New model wins. Right?

Well, not so fast.

{{figure:0}}

The chart tells the story of the validation experiments, but it doesn't answer how the models handle a genuinely different scene. In a separate **805-image field benchmark**, EXP-014 reached **85.8% image-level class-presence F1**, the highest result among the 11 models evaluated there.

Here's the important technical catch: **mAP50 and image-level F1 are not the same metric.** mAP50 checks how well the detector's boxes overlap annotated objects at an intersection-over-union threshold of 0.5. Image-level class-presence F1 asks whether the right classes appear anywhere in the image. It doesn't directly score where the boxes are.

And EXP-019 wasn't part of that 805-image benchmark. So I cannot honestly claim that EXP-014 *measured* better than EXP-019 in a fair head-to-head test. What I *can* say is that my less-controlled testing made me distrust the newer model's apparent improvement, and the separate benchmark showed that EXP-014 deserves serious attention.

Those are useful clues, not a completed comparison.

### A pretty good score can still hide an ugly failure

One example I keep coming back to is the trash class. On the clean validation set, its recorded mAP50 reached **97.5%**. In the separate field benchmark, EXP-014's trash F1 was **54%**.

Again, those results come from different evaluations and can't be subtracted as though they measured one thing. But the difference in how difficult "trash" appears across settings is exactly why evaluation design matters.

Real objects overlap. Paper gets crumpled. Cans are photographed from the opening. Backgrounds and lighting are inconsistent. A model that looks brilliant on clean images can still make very annoying mistakes when I point a camera at an actual pile of waste.

I don't think the responsible conclusion is "the model is bad." It's "I need better evidence before calling it good."

### Making the models usable is its own project

Training isn't the only part of MIRA. I also wanted to *use* the detector instead of leaving it in a notebook.

The project has a command-line tool for live webcam or RTSP stream inference, an optional ByteTrack tracker, a FastAPI-based dashboard, dataset tools and model exports. The \`mira-ai\` package can be installed through PyPI, and additional models are published on Hugging Face.

There's another trade-off once the model leaves PyTorch. An exported LiteRT/TFLite model at 320-pixel input size is about **3.02 MB**, compared with **5.47 MB** for the original PyTorch weights. On the recorded validation setup the smaller export scored **86.2% mAP50**, below the full model's 90.6%.

Smaller files are useful for eventual edge devices, but shrinking the file doesn't magically make it an accurate or fast Raspberry Pi deployment. I still don't have a measured Raspberry Pi result for the final detector.

{{figure:2}}

If you're wondering about the Hugging Face download number: it's over 9,000 lifetime file requests in the recorded snapshot, **not** over 9,000 unique people. I wrote [a separate, less serious blog post](/blog/am-i-famous-now/) explaining that whole situation.

### So what now?

The next direction, EXP-020, is an attempt to combine two things I liked: the cleaner, balanced training data behind EXP-019 and the more varied real-world backgrounds behind EXP-014.

The hypothesis is that the mix could generalize better. But I won't put a new victory number on this page until there's a recorded evaluation that actually supports it.

For now, MIRA is still a research project. It recognizes objects in images and video, but it isn't a finished automatic sorting robot. The independent 1,375-image test split for the final runs hasn't been evaluated, and I haven't measured the final detector on a Raspberry Pi.

To be honest, I liked seeing 90.6%. I liked it a lot. But realizing that I couldn't blindly trust it probably taught me more.

## In numbers

- Logged experiments: EXP-001 to EXP-019; EXP-020 planned/in training, with no reported result here
- Best recorded clean validation score: 90.6% mAP50 (EXP-018), 90.58% on repeat (EXP-019), 415 images
- Field benchmark: EXP-014, 85.8% image-level class-presence F1 (92.9% precision, 79.7% recall), 805 images
- Dataset: 6,898 images, 12,832 boxes (5,108 training / 415 validation / 1,375 test)
- Detector: YOLO11n, about 2.58 million parameters
- Model sizes: PyTorch 5.47 MB; 320-pixel LiteRT export 3.02 MB
- Recorded 320-pixel LiteRT validation: 86.2% mAP50
- GPU inference: 1.5 to 3.6 ms/frame on a T4 in the recorded setup, not a Raspberry Pi measurement
- Downloads: 9.1K+ lifetime model downloads on Hugging Face (file requests, not unique people)

## Figures

- ![Line chart of recorded validation mAP50 across EXP-013 through EXP-019, showing the large jump in the clean-data runs.](mira/detector-history.en.png) Validation mAP50 for the detector experiments; these are not field-test results.
- ![Per-class validation mAP50 comparison before and after rebuilding the dataset: glass, metal, paper, plastic and trash.](mira/class-map.en.png) Per-class validation metrics before and after the dataset rebuild.
- ![Comparison of model file sizes for PyTorch, ONNX and LiteRT exports.](mira/export-sizes.en.png) The same detector exported in several formats; smaller files can come with evaluation trade-offs.

## Links

- [Source repository: MIRA-AI](https://github.com/jeremy341/MIRA-AI)
- [Project website](https://mira-vision.vercel.app/)
- [Hugging Face model files](https://huggingface.co/Jeremy341/MIRA-AI)
- [PyPI package: mira-ai](https://pypi.org/project/mira-ai/)
