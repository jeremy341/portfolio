# MobileNet on FPGA

- Original content ID: fpga
- Category: Hardware & embedded
- Status: Work in progress
- Technologies and topics: MobileNet, Quantization, TFLite, FPGA

## Summary

I'm checking how far a small neural network can be squeezed, down to 8-bit integers and then toward hardware, before anyone designs for it.

## Context and motivation

This project came out of my work with people connected to the Chair of Electronic Components and Circuits (EBS) at the University of Duisburg-Essen. I looked at MobileNet V1 and V2, edge AI and quantization, and at what it would take to run such a network on an FPGA.

The question sounds simple. How much accuracy does a small network keep when it's converted to 8-bit integers, the form hardware handles most easily? If the answer is "a lot", an accelerator design is worth the effort. If it's "almost none", the design has to be different. That's why the answer should exist before anyone draws the hardware.

## Inside the project

This is the software half of the path to hardware. Two small networks are trained, quantized and inspected, so the hardware side has real numbers to design against instead of guesses.

### What I built

- I wrote the Keras versions of MobileNetV1 (13 depthwise-separable blocks) and MobileNetV2 (17 inverted-residual blocks) by hand, at a width multiplier of 0.5 and an input size of 128 by 128 pixels.
- I trained on CIFAR-10: 45,000 training, 5,000 validation and 10,000 test images, upscaled from 32 to 128 pixels. It ran in a [Kaggle](https://www.kaggle.com/) GPU notebook with early stopping.
- Then I ran full-integer post-training quantization to [TFLite](https://www.tensorflow.org/lite), calibrated on 200 training images, with INT8 input and output.
- An evaluation script runs the INT8 model through the [TFLite](https://www.tensorflow.org/lite) interpreter on all 10,000 test images. I also inspected the converted graphs layer by layer, checking tensor types, shapes and scales.
- I also analysed the bit widths. The largest product of two INT8 values fits in 15 bits. The accumulators need 19 to 25 bits, and the widest one sits in the V2 classifier, which sums 640 products, so a 32-bit accumulator has room to spare.

### What it is not

An FPGA implementation is outside the scope of this repository. There's no HDL or HLS code, no resource estimate and no latency measurement. The title names the direction of the work, but it doesn't describe a finished deployment.

## In numbers

- Accuracy on the 10,000 CIFAR-10 test images: V1 76.72% as Float32 and 76.35% as INT8; V2 77.93% as Float32 and 77.94% as INT8
- Size of the [TFLite](https://www.tensorflow.org/lite) file: V1 from 3.29 MB to 0.99 MB (3.34 times smaller); V2 from 2.35 MB to 0.85 MB (2.78 times smaller)
- Parameters in Keras: V1 834,666 and V2 604,234, which is 27.6% fewer
- Training: Adam at 1e-3, batch size 128, stopped early after 26 epochs (V1) and 23 epochs (V2), one random seed
- Quantization: full-integer post-training, 200 calibration images
- Bit widths: products 15 bits, accumulators 19 to 25 bits, biases 32 bits
- Not measured: latency, multiply-accumulate counts and FPGA resources

## Figures

- ![Bar chart of CIFAR-10 test accuracy: MobileNetV1 76.72 percent as Float32 and 76.35 as INT8, MobileNetV2 77.93 as Float32 and 77.94 as INT8.](mobilenet-on-fpga/accuracy.en.png) Test accuracy before and after INT8 quantization.
- ![Bar chart of the TFLite file size: MobileNetV1 3.29 MB as Float32 and 0.99 MB as INT8, MobileNetV2 2.35 MB and 0.85 MB.](mobilenet-on-fpga/size.en.png) [TFLite](https://www.tensorflow.org/lite) file size, Float32 and INT8.

## Where it stands

This is work in progress. The model and quantization side exists, but the FPGA side doesn't, so there's no hardware target and no latency or resource figure.

I also wrote down the weak points of my own method, because they change how much the numbers are worth. The calibration images are the first 200 of the training pool, and at this seed 25 of them belong to the validation split. The evaluation quantizes the input by truncating instead of rounding. There's only one seed, and training accuracy approaches 100%, which is overfitting. The images are also upscaled from 32 pixels, so they carry less detail than the network input suggests.

Next come several seeds, calibration from the training split only, and a latency figure on a named target.

## Links

- [Source repository: Mobilenet-fpga](https://github.com/jeremy341/Mobilenet-fpga)

The source is public, but it contains no HDL or HLS code. It isn't proof of a completed FPGA implementation.
