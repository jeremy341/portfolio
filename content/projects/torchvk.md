# TorchVK

- Original content ID: torch
- Category: Systems & compute
- Status: Early research
- Technologies and topics: Vulkan, PyTorch, GPU compute

## Summary

I'm investigating whether I can train PyTorch models on my old AMD GPU using Vulkan. There isn't a working TorchVK backend yet; this is the research and feasibility stage.

## Story

For most of MIRA's training runs, I used Kaggle. Nothing particularly strange about that, except for one small detail: there was already a GPU sitting in my own computer.

An AMD Radeon RX 5600 XT, to be precise.

For a long time I just accepted that PyTorch training on Windows wasn't really going to happen on this card. I had a working notebook in Kaggle, so why question it? It wasn't until I started thinking about another machine-learning project that the arrangement began to bother me.

Why was I borrowing compute when I already owned a GPU? And if the problem wasn't that my GPU couldn't calculate anything, what was actually stopping PyTorch from using it?

That's where TorchVK began. Not with a groundbreaking performance result, but with a question I had been avoiding.

### The GPU works

Most PyTorch tutorials treat `torch.cuda` as the obvious way to run training on a GPU. That makes sense for supported NVIDIA hardware: CUDA has mature libraries and extensive PyTorch integration. AMD has ROCm, but GPU, operating-system and version support matter. My RX 5600 XT on Windows isn't a convenient supported target.

The frustrating part is that this doesn't mean the card is unable to perform parallel calculations. It can run graphics applications, and [Vulkan](https://www.vulkan.org/) exposes compute functionality across GPU vendors.

So Vulkan looked like a possible route around the software support problem. The first idea was simple enough: if the GPU can execute Vulkan compute shaders, perhaps I could connect that capability to PyTorch.

Except there's a fairly large difference between running *a* shader and training a neural network.

A training backend needs to store tensors, execute a wide range of operations, preserve numerical correctness and handle gradients so model parameters can be updated. It also has to manage memory and synchronization efficiently. If every operation copies data back to the CPU, then getting a shader to run doesn't solve much.

Which changes the question. It's not "can Vulkan add numbers?" It is "can a usable training path be built on top of Vulkan, and how much of it will actually run on the GPU?"

### Not the first

I started reading about existing attempts, including [torchvulkan](https://github.com/zainsharief/torchvulkan). Other people had already explored Vulkan and PyTorch integration.

Initially, that sounded like it might kill the idea. What's the point of making another backend if one exists?

But research doesn't become pointless just because somebody has worked on the same topic. It gives you something concrete to evaluate. Does an existing solution train models on *my* RX 5600 XT? Does it silently fall back to the CPU? Can I reproduce its results, identify the missing operations and measure where the time goes?

That's a narrower and, frankly, more useful research question than trying to announce that I had invented Vulkan machine learning.

If an existing backend turns out to be better, contributing to it may be more sensible than maintaining an inferior duplicate. I want to understand the problem, not win a naming competition.

### What PyTorch talks to

One integration route I want to explore is **PrivateUse1**, PyTorch's mechanism for registering custom device backends. It could provide the connection between PyTorch operators and a C++ runtime responsible for allocating GPU buffers, dispatching operations and synchronizing their results.

That runtime would then invoke Vulkan compute pipelines using **SPIR-V**, the intermediate representation consumed by Vulkan shaders. This is my current architectural *hypothesis*:

```flow
PyTorch operation
PrivateUse1 custom device integration
TorchVK C++ runtime: memory, dispatch, synchronization
Vulkan compute pipeline
SPIR-V shader running on the GPU
```

It's tempting to look at that diagram and imagine a functioning backend. But the boxes are easy to draw; making them agree on memory ownership, tensor shapes and execution order is the difficult part.

The sensible first milestone is much smaller. Allocate buffers, send some values to the device, dispatch a vector-addition shader, retrieve its output and check every result against a trusted CPU calculation.

Vector addition isn't exactly the most exciting achievement in machine learning. That's kind of the point. If I can't prove that a tiny operation is correct, timing an entire neural network would only give me a faster way to measure a mistake.

### Six experiments

Once one operation works, I can finally start asking performance questions. But even those need an order.

First, **vector addition** checks correctness and exposes how expensive memory transfers and dispatch can be for a small workload. Next, **matrix multiplication** tests an operation that actually matters for neural networks, where memory access patterns and shader design become much more important.

If those work, **MNIST training** would test whether forward and backward passes can stay on the device. A **CIFAR-10 convolutional network** would add more demanding operations. Then **low-VRAM tests** would show what happens when an older 6 GB card runs into memory pressure.

Finally, I'd run **ablations**: change one implementation choice at a time and see which change affects the result. Without that, it's very easy to modify several settings, get a faster run and have absolutely no idea why.

There's another distinction I want to keep clear throughout. A fast GPU kernel isn't the same as a fast end-to-end training step. Dispatch overhead, transfers, synchronization and unintended CPU fallbacks can erase what looked like a win in an isolated benchmark.

So each experiment should answer a question that makes the *next* experiment worth attempting. Otherwise I'm just collecting numbers.

### The result I don't have

As of the research documented in the public repository, **TorchVK is still at the feasibility stage**. There is no working training backend, no implemented GPU compute shader and no measured benchmark result I can claim here.

I could write a much more impressive-sounding project page by treating the roadmap as completed work. But that wouldn't make it any more real.

The next concrete step is proving one device operation works correctly, without a hidden CPU fallback. After that comes a fair performance comparison. Only then will it make sense to talk seriously about training.

Maybe Vulkan will give my old AMD card a useful training path. Maybe I'll discover a different implementation is better, or that the overhead is worse than I expected. Either way, I'll understand GPU software a lot better than I did when I was automatically opening Kaggle.

And that was the question that started this in the first place: if I already have the hardware, what would it take to actually use it?

## In numbers

- Stage: R0, research and feasibility; no completed GPU training backend
- Code: no implemented backend or shader in the public repository
- Planned experiments: 6 (not completed benchmarks)
- Benchmarks and results: none
- Target hardware: Radeon RX 5600 XT, 6 GB VRAM, Windows
- Roadmap estimate: 300 to 650+ hours for the complete research scope, not time already spent

## Links

- [Source repository: TorchVK](https://github.com/jeremy341/TorchVK)
- [PyTorch documentation](https://pytorch.org/)
- [Vulkan overview](https://www.vulkan.org/)
