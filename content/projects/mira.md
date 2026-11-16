# MIRA

- Original content ID: mira
- Category: Machine learning
- Status: Experiment
- Technologies and topics: Computer vision, Python, YOLO, ONNX

## Summary

I taught a camera to recognize waste, from a small classifier to YOLO detection. A great validation score didn't always mean a great real-world model.

## Story

I remember seeing **90.6% mAP50** on MIRA's validation results and feeling genuinely excited. After all the training runs, dataset changes and failed ideas, there was finally a number that made the work look like it was paying off.

At least, that's what I thought.

Because the moment I started testing the models on less controlled images, that confidence became harder to justify. In my own real-world trials, the newer model didn't consistently seem as reliable as EXP-014, an older experiment with a much less impressive validation score.

So how does a model get *better* on paper while leaving me less convinced when I actually use it? That question ended up shaping the next stage of MIRA.

### From recognizing an image to finding an object

MIRA stands for **Machine Intelligence for Recycling Automation**. The long-term idea is waste sorting with a camera and a small model. Before I could think about building a sorter, though, I needed to find out whether the software could recognize the waste in the first place.

I began with 796 photos divided into four classes, trained a small convolutional neural network (CNN), and later fine-tuned MobileNetV2. That classifier reached roughly 87% validation accuracy, and I managed to export a 2.6 MB INT8 TFLite version.

That was a useful start. But imagine putting two bottles and a piece of paper in front of the camera. A classifier can tell you which category best describes the *whole image*. It won't tell a sorting mechanism where each item is. For that, I needed **object detection**, where a model predicts both a class and a bounding box around an object.

So I moved to YOLOv8n and eventually YOLO11n, this time detecting glass, metal, paper, plastic and trash. That solved the *type* of problem I was asking the model to solve. It didn't yet solve the much more annoying question of what data I should trust.

### The dataset was part of the experiment

My images didn't come from one neat source. I combined data from [TACO](https://tacodataset.org/), [TrashNet](https://github.com/garythung/trashnet), [Roboflow](https://roboflow.com/) and a dataset by dmedhi. Some images had clean backgrounds and isolated objects. Others showed actual litter in complicated scenes.

At first, adding more images seemed like an obvious improvement. More examples should mean more learning, right? Except the sources had different labeling conventions, class distributions and visual conditions. More data wasn't necessarily better *data*.

I tested different combinations, removed WaRP after it made the results worse, and eventually rebuilt a balanced dataset. The new split used a fixed random seed and SHA-256 deduplication to reduce the risk of duplicate files appearing in training and evaluation. The resulting dataset contained **6,898 images and 12,832 boxes**, divided into 5,108 training, 415 validation and 1,375 test images.

That rebuild was followed by a dramatic jump in the recorded per-class validation scores:

{{figure:1}}

Looks like a huge improvement. And on the chosen validation set, it was. But there's a detail I didn't appreciate enough at first: those 415 validation images were comparatively clean and tabletop-like.

Which means the next question wasn't simply whether the score had increased. It was whether I'd made a model that understood waste better, or a model that had become particularly good at *that kind of image*.

### Two good runs, but what does "good" mean?

Consider the numbers. EXP-014, trained with an older and more varied dataset mix, achieved **60.7% mAP50** on its recorded validation split. After the rebuild, EXP-018 and EXP-019 reached roughly **90.6% mAP50** on the cleaner 415-image split, with almost the same result on the repeat run.

Same project, much higher number, repeatable result. You can probably see why I was thrilled. Surely the newer model had won?

Well, testing on less controlled images made that conclusion uncomfortable.

{{figure:0}}

In a *separate* 805-image field benchmark, EXP-014 achieved **85.8% image-level class-presence F1**, the strongest result among the 11 models evaluated there. That might sound like an easy comparison with 90.6%, but it isn't. The two numbers don't measure the same thing, and **EXP-019 wasn't included in that field benchmark**.

To understand why, we need two definitions. **mAP50** evaluates predicted object boxes and classes at a 0.5 intersection-over-union threshold. **Image-level F1** evaluates whether the right classes are present somewhere in the image, without directly checking the boxes. Different datasets and different metrics mean 85.8% and 90.6% cannot be ranked against each other.

So I don't have a fair head-to-head result proving EXP-014 beats EXP-019. I have something less satisfying, but much more useful: a reason to question whether my clean validation split reflects the situations that matter to me.

### The number was hiding a different problem

The trash class illustrates the difficulty. On the clean validation data, the recorded mAP50 for trash reached **97.5%**. EXP-014's trash class scored **54% F1** in the separate field evaluation. Again, these aren't directly comparable scores. But they remind me how differently the same category behaves under different conditions.

In an actual scene, paper is crumpled, metal might only be visible from one angle, and objects overlap. Good lighting and carefully arranged backgrounds aren't guaranteed. Training and evaluating mostly on clean images can make the model look much more dependable than it feels when I point a camera at a messy pile of waste.

That doesn't mean EXP-019 is worthless, or that EXP-014 is universally better. It means my evaluation still has a gap. And declaring a winner before testing both on the same independent data would be doing exactly what got me into this situation.

### Getting the model out of the notebook

There was also a practical question I couldn't avoid: even if I trusted the model, how would someone actually use it?

MIRA now has a command-line tool for webcam and RTSP inference, optional ByteTrack tracking, a FastAPI dashboard, dataset utilities and exported models. The `mira-ai` package is on PyPI, with model files on Hugging Face.

Exporting exposed a second trade-off. The original PyTorch weights are about **5.47 MB**, while a 320-pixel LiteRT/TFLite export is about **3.02 MB**. That's attractive if the eventual target is a small device. But the recorded validation score for that export was **86.2% mAP50**, not the full model's 90.6%, and smaller files don't automatically guarantee faster inference.

{{figure:2}}

I still don't have a measured deployment result for the final detector on a Raspberry Pi. That's another experiment, not an achievement I can quietly add to a project page.

And regarding the 9,000-plus Hugging Face "downloads": those are lifetime model-file requests, **not** 9,000 unique people. I wrote [a separate blog post](/blog/am-i-famous-now/) about why that distinction matters. Apparently even my download counter has a validation problem.

### So where does that leave EXP-020?

EXP-020 is meant to test the obvious follow-up hypothesis: combine the balanced, cleaner training data behind EXP-019 with the varied backgrounds that made EXP-014 worth revisiting. Then evaluate the models under genuinely comparable conditions.

I don't have a verified EXP-020 result to report here, and the independent 1,375-image test split hasn't yet been used to establish a final score for these runs. MIRA is still an experiment, not an autonomous recycling robot.

Would I like the next model to score higher? Obviously. But I want the number to tell me something about what the model can do *outside* the validation set.

I was thrilled by that 90.6%. I still think it's a nice result. I just learned that the most interesting part of it was the question it couldn't answer.

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
