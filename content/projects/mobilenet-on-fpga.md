# MobileNet on FPGA

- Original content ID: fpga
- Category: Hardware & embedded
- Status: Work in progress
- Technologies and topics: MobileNet, Quantization, TFLite, FPGA

## Summary

I compared two small neural networks, converted them to INT8, and measured what happened to their accuracy and size. The work is preparation for possible FPGA hardware, not an FPGA implementation.

## Story

A neural network that works on a powerful GPU is cool. But what happens when you want to run one on hardware with much less memory and compute?

That's the question behind my MobileNet experiment, which came out of project work connected to the Chair of Electronic Components and Circuits at the University of Duisburg-Essen.

The goal wasn't to build an FPGA accelerator in a weekend. It was to answer something more basic first: **if I make a model smaller and switch its calculations from floating-point numbers to 8-bit integers, how much accuracy do I lose?**

Because there's not much point designing hardware around an idea if the model becomes useless as soon as you convert it.

### First, two networks that are actually designed to be small

I chose MobileNetV1 and MobileNetV2. Both use *depthwise convolutions*, which process spatial information one channel at a time, followed by pointwise operations that mix channels. That can make them much cheaper than standard convolutions.

MobileNetV2 adds **inverted residual blocks**: expand the channels, apply a depthwise operation, then project back down through a linear bottleneck. The idea is to preserve useful information while keeping the expensive operations manageable.

I built the architectures in Keras rather than simply importing pretrained models. That let me inspect the operations and tensor shapes directly. For both, I used an input size of 128×128 pixels and a width multiplier of 0.5, meaning the networks use fewer channels than their full-width versions.

The experiment used CIFAR-10: 45,000 training images, 5,000 validation images and 10,000 test images, resized from 32×32 pixels to 128×128. Both networks trained with Adam and early stopping. This is a controlled comparison, not a claim that CIFAR-10 looks like a real deployment environment.

### What exactly is INT8 quantization?

Normally, a lot of neural-network arithmetic is done with 32-bit floating-point values, called Float32. You can represent a huge range of numbers, but storing and multiplying them takes more bits than simpler integer formats.

With **quantization**, you approximate those values with a smaller set of integers and keep scale information that maps the integers back to the values they represent. INT8 uses signed 8-bit values, typically from -128 to 127.

That sounds as though it should always hurt accuracy. You're literally throwing away numerical precision.

For this experiment I used full-integer, post-training quantization to TFLite. The training still happened in Float32; a calibration pass over 200 images helped choose the numerical ranges for the converted model. The exported models use INT8 for inputs and outputs.

The interesting question was whether the lower precision would noticeably hurt classification.

### The results were closer than you might expect

The recorded test accuracy numbers were:

| Model | Float32 | INT8 | Difference |
| --- | ---: | ---: | ---: |
| MobileNetV1 | 76.72% | 76.35% | -0.37 points |
| MobileNetV2 | 77.93% | 77.94% | +0.01 points |

{{figure:0}}

MobileNetV1 lost 0.37 percentage points. MobileNetV2's INT8 model scored **0.01 percentage points higher**, which sounds like an improvement until you remember the test set has 10,000 images. That's exactly one additional correct prediction.

So no, I wouldn't call that evidence that quantization somehow improved MobileNetV2. It's effectively the same observed accuracy in this one run.

The file sizes changed much more clearly:

| Model | Float32 TFLite | INT8 TFLite |
| --- | ---: | ---: |
| MobileNetV1 | 3.29 MB | 0.99 MB |
| MobileNetV2 | 2.35 MB | 0.85 MB |

{{figure:1}}

That made the V1 file roughly **3.34× smaller** and the V2 file roughly **2.78× smaller**, while the recorded accuracy stayed close.

This doesn't automatically mean the INT8 version runs 3× faster. File size, execution latency, memory access and hardware support are different measurements. I didn't benchmark an FPGA implementation because there isn't one here.

### Why the numbers matter for hardware

When a model runs on custom hardware, you have to decide how wide its arithmetic units and accumulation registers are.

An INT8 multiplication produces a result that may need up to **16 signed bits**. Then a convolution or fully connected layer may add hundreds of those products together, so the accumulator needs more headroom. The project contains a bit-width analysis of the actual layer shapes and reduction lengths; for the recorded configurations, 32-bit accumulation provides enough room.

That analysis is useful before implementing anything in HDL or HLS (hardware-description and high-level-synthesis languages). It helps you estimate which operations and widths an eventual accelerator would need to support.

But those are arithmetic requirements, not FPGA resource measurements. No logic elements, DSP blocks, power draw or measured latency are reported here.

### A few things I would improve before trusting the comparison too much

I don't want to overstate this experiment.

It used **one training seed**, so there's no estimate of run-to-run variation. The calibration selection included 25 images that fell in the validation split under the recorded data partition, so I would redo calibration using strictly training-only samples. The evaluation code also truncates quantized input values rather than rounding them, which should be corrected before making a stronger comparison.

And the training curves show overfitting: training accuracy approached 100% while validation accuracy plateaued. Resizing tiny CIFAR-10 images to 128×128 doesn't introduce more actual visual detail, either.

I also don't have a particularly dramatic personal story about the training run anymore. What I still find useful is the engineering lesson: **you can sometimes cut model size substantially without destroying the measured accuracy, but you need a fair evaluation before you claim anything about deployment.**

### Where I'd take it next

I'd retrain across several seeds, clean up the calibration split and input rounding, and get a measured latency result on a **named hardware target**.

Only then would I start making claims about what an FPGA accelerator could realistically offer.

For now, this is the software and numerical-analysis half of an eventual hardware problem. And that's already a pretty useful half to understand.

## In numbers

- Dataset: CIFAR-10, 45,000 training / 5,000 validation / 10,000 test images
- Models: MobileNetV1 (834,666 parameters) and MobileNetV2 (604,234 parameters)
- Model input: 128×128 RGB, width multiplier 0.5
- Test accuracy V1: Float32 76.72%, INT8 76.35%
- Test accuracy V2: Float32 77.93%, INT8 77.94%
- File size V1: 3.29 MB Float32 TFLite, 0.99 MB INT8
- File size V2: 2.35 MB Float32 TFLite, 0.85 MB INT8
- Training: Adam at 1e-3; early stop after 26 and 23 epochs; one seed
- Calibration: 200 images, with a known split-overlap limitation
- FPGA code and resource measurements: none

## Figures

- ![Bar chart comparing MobileNetV1 and MobileNetV2 Float32 and INT8 classification accuracy on CIFAR-10.](mobilenet-on-fpga/accuracy.en.png) Accuracy on the 10,000-image CIFAR-10 test set.
- ![Bar chart comparing Float32 and INT8 TFLite model file sizes for MobileNetV1 and MobileNetV2.](mobilenet-on-fpga/size.en.png) Model file-size reduction after INT8 quantization.

## Links

- [Source repository: Mobilenet-fpga](https://github.com/jeremy341/Mobilenet-fpga)
- [Recorded comparison and evaluation](https://github.com/jeremy341/Mobilenet-fpga/blob/main/results/comparison.md)
- [Bit-width analysis](https://github.com/jeremy341/Mobilenet-fpga/blob/main/results/bit_width_analysis.md)
