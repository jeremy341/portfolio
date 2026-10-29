# TorchVK

- Original content ID: torch
- Category: Systems & compute
- Status: Early research
- Technologies and topics: [Vulkan](https://www.vulkan.org/), [PyTorch](https://pytorch.org/), GPU compute

## Summary

I'm trying to run [PyTorch](https://pytorch.org/) training on GPU compute through [Vulkan](https://www.vulkan.org/), on a consumer card that the usual stacks don't serve well.

## Context and motivation

Most deep learning on GPUs assumes NVIDIA's CUDA or AMD's ROCm. On some consumer cards those stacks are weak or missing, so the owner ends up with a fast GPU that can really only be used for games. That's the problem TorchVK is my attempt at. I want another route: [PyTorch](https://pytorch.org/) training and general GPU compute through [Vulkan](https://www.vulkan.org/), which runs on almost any modern graphics card.

I picked one specific target on purpose: a Radeon RX 5600 XT with 6 GB of memory on Windows. Writing for every GPU at once would make the project vague. A single card I own gives me a question I can actually answer.

## Inside the project

TorchVK is still at the planning stage. The public repository holds documents, and there's no backend, no shader and no benchmark yet. What exists is the question, a survey of related work and the design I want to test. I'd rather say that plainly than make the repository look further along than it is.

### The question

Can [PyTorch](https://pytorch.org/) training run on a consumer GPU through [Vulkan](https://www.vulkan.org/) Compute, on a card that CUDA and ROCm serve badly? The experiments are meant to answer that with measurements. The answer could be "not yet", and I'd still write that up.

### Related work, and why this isn't a first

[Vulkan](https://www.vulkan.org/) backends for [PyTorch](https://pytorch.org/) already exist, so TorchVK doesn't claim to be the first. torchvulkan documents a PrivateUse1 device that trains MNIST and a tiny [GPT](https://openai.com/). There's also torch-vulkan and [PyTorch](https://pytorch.org/)'s own older [Vulkan](https://www.vulkan.org/) backend. The gap I want to test is narrower. I want training that can be verified as GPU-only, with no silent fallback to the CPU, and I want it to work on an RDNA1 card under Windows. I also want to train a small CNN with little video memory, and I want benchmarks that someone else can reproduce on their own machine.

### The planned design

[PyTorch](https://pytorch.org/) talks to a custom PrivateUse1 device, which is a C++ extension that drives [Vulkan](https://www.vulkan.org/). Shaders are written in GLSL or Slang and compiled to SPIR-V.

```text
PyTorch  ->  PrivateUse1 device  ->  TorchVK C++ extension
         ->  Vulkan device, allocator, queues, pipeline cache
         ->  GLSL or Slang  ->  SPIR-V  ->  GPU
```

The first exercise is deliberately small. Pick a device, allocate staging and device buffers, compile a shader, dispatch a vector addition, wait for it to finish and compare the result with the CPU. If that doesn't match, nothing above it is worth building.

### The experiments, written down first

I wrote down six experiments before I wrote any code: vector addition from one thousand to ten million elements, matrix multiplication from 128 to 4096, an MNIST classifier, a CIFAR-10 CNN, sensitivity to small video memory, and one-at-a-time ablations. The results column is empty on purpose. If I write the plan first, I can't quietly pick the experiments that look good afterwards.

## In numbers

- Stage: R0, the survey of competitors and the hardware feasibility check; every item of it is still open
- Code: none yet, the repository holds planning documents only
- Planned experiments: 6
- Benchmarks and results: none
- Target hardware: Radeon RX 5600 XT, 6 GB
- Estimated effort: 300 to 650 hours or more for a full result with a reviewed report, according to the roadmap

## Where it stands

TorchVK is early research, not a working GPU backend. The repository says it doesn't offer a usable backend yet, and it claims no performance or compatibility results. It also lists what the project won't try to do: support every piece of hardware, reinvent autograd, train very large language models, replace CUDA or promise speedups.

The competitor details are a snapshot from 10 October 2026. I haven't reproduced any of the other projects' results myself, so I cite them the way their authors report them.

## Links

- [Source repository: TorchVK](https://github.com/jeremy341/TorchVK)
