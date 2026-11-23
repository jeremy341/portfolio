# MobileNet on FPGA

- Original content ID: fpga
- Category: Hardware & embedded
- Status: Work in progress
- Technologies and topics: MobileNet, Quantization, TFLite, FPGA

## Summary

I compared MobileNetV1 and V2 before and after INT8 conversion, measuring model size and accuracy ahead of possible FPGA hardware.

## Story

Making a neural network smaller sounds like an obvious improvement when you want to run it on limited hardware. Less memory, fewer calculations, hopefully less power. But there's a catch: shrinking the numerical representation means throwing away precision.

So how much of the model's accuracy disappears with those extra bits?

That became the central question of my MobileNet experiment, part of project work connected to the Chair of Electronic Components and Circuits at the University of Duisburg-Essen. The long-term context is FPGA hardware, where you can design the arithmetic rather than simply rely on a general-purpose GPU. But before thinking about building an accelerator, I wanted to know what numerical format that accelerator would have to support.

And the results were a little less predictable than the phrase "lower precision" might suggest.

### Small models first

I chose MobileNetV1 and MobileNetV2 because both were designed with efficiency in mind.

A standard convolution processes spatial information and mixes channels in one expensive operation. A **depthwise separable convolution** splits that work: a depthwise operation processes each channel separately, then a pointwise operation combines them. MobileNetV2 goes further with **inverted residual blocks**, expanding channels for computation before projecting them back through a linear bottleneck.

Those choices matter if you later want to map the calculations to constrained hardware. They also gave me two different architectures to compare without jumping straight to a massive model.

I implemented the networks in Keras rather than loading ready-made pretrained weights. Both used 128×128 RGB inputs and a width multiplier of 0.5, which reduces their number of channels. I trained on CIFAR-10, dividing it into 45,000 training, 5,000 validation and 10,000 test images, with Adam and early stopping.

CIFAR-10's original images are only 32×32 pixels, so resizing them to 128×128 doesn't create any new detail. The purpose was a controlled software comparison, not proof that these networks would behave identically on a real camera or FPGA.

### Float32 to INT8

The Float32 versions represent values with 32-bit floating-point numbers. That gives a wide range of representable values and a certain numerical precision, but it also costs storage and more complex arithmetic.

**INT8 quantization** approximates those values using signed 8-bit integers, commonly in the range -128 to 127, together with scales that tell the model how those integers relate to the original values.

The immediate benefit is easy to understand: smaller weights can occupy fewer bytes. The less obvious part is the effect on predictions. If two activation values that were previously distinguishable get rounded to the same integer, the network has lost some information. Repeat that across many operations, and you might expect a visible loss of accuracy.

To find out, I first trained the models in Float32, then converted them to full-integer TFLite models. A 200-image calibration pass was used to estimate the ranges needed for quantization, and the exported models used INT8 inputs and outputs.

The plan was straightforward: compare both versions on the same 10,000-image test set and see whether the reduction in precision cost too much.

### Accuracy was not the drama

Here are the recorded results:

| Model | Float32 | INT8 | Difference |
| --- | ---: | ---: | ---: |
| MobileNetV1 | 76.72% | 76.35% | -0.37 points |
| MobileNetV2 | 77.93% | 77.94% | +0.01 points |

{{figure:0}}

MobileNetV1 lost 0.37 percentage points. That's a small difference, but at least it goes in the direction you'd expect.

MobileNetV2 was more interesting: its INT8 export scored **77.94%**, compared with **77.93%** for Float32. Does that mean reducing precision made the model better?

Not really. On a test set of 10,000 images, that difference is exactly *one* additional correct prediction. One training run and one test set aren't enough to argue that quantization improved accuracy. The meaningful observation is that the measured accuracy stayed almost unchanged.

Which brings us back to the original reason for doing this. If the predictions barely changed, how much smaller did the model become?

The file-size comparison was much clearer:

| Model | Float32 TFLite | INT8 TFLite |
| --- | ---: | ---: |
| MobileNetV1 | 3.29 MB | 0.99 MB |
| MobileNetV2 | 2.35 MB | 0.85 MB |

{{figure:1}}

That's approximately **3.34 times smaller** for V1 and **2.78 times smaller** for V2. So the interesting result wasn't the extra 0.01 percentage points. It was how much storage I could save without observing a substantial accuracy drop in that test.

But a smaller file still isn't the same thing as a faster network.

### Why size is not enough

On an FPGA, you have to choose the arithmetic resources that will carry out each operation. An INT8 multiplication can require up to **16 signed bits** for its result. A convolution then sums many products together, so its accumulator needs enough bits to avoid overflow.

The project includes a bit-width analysis using the model's layer shapes and reduction lengths. For the recorded configurations, a 32-bit accumulator provides enough room.

That's useful planning information. It tells me something about the operations an eventual design would need, and it gives me a way to reason about memory and arithmetic cost before writing hardware-description code.

What it doesn't tell me is how many DSP blocks an FPGA implementation would use, how much power it would draw or how quickly it could classify an image. I haven't implemented the FPGA part, and there are no measured hardware resource or latency results to report.

So the experiment answered one important question about the *model representation*. It didn't answer the next question about *execution on hardware*.

### What I'd test next

There are also limitations in the software comparison itself. I used **one training seed**, so I don't have a distribution of results across independent runs. The recorded calibration selection included 25 images overlapping the validation split, which I'd fix by sampling strictly from the training split.

The quantized input evaluation also used truncation rather than rounding. That's worth correcting before interpreting small accuracy differences. And the training curves show overfitting: training accuracy approached 100% while validation accuracy leveled off.

Those aren't reasons to throw the results away. They're reasons to be specific about what the results actually establish.

I'd repeat the experiments with multiple seeds, clean up calibration and input conversion, then measure end-to-end inference on a named hardware target. Only with those numbers could I start talking about actual FPGA acceleration.

The experiment began with a simple worry: would INT8 make a small model too inaccurate to be useful? In this run it didn't. That gives me a reason to continue, not a license to claim I've built a fast accelerator.

And for an engineering project, knowing exactly which question you've answered is at least as important as getting an impressive number.

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
