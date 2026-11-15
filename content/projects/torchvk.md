# TorchVK

- Original content ID: torch
- Category: Systems & compute
- Status: Early research
- Technologies and topics: Vulkan, PyTorch, GPU compute

## Summary

I'm investigating whether I can train PyTorch models on my old AMD GPU using Vulkan. There isn't a working TorchVK backend yet; this is the research and feasibility stage.

## Story

So here's something that bothered me for a while without me actually questioning it: I had a graphics card sitting in my PC, but whenever I wanted to train MIRA, I went straight to Kaggle.

Not because I particularly enjoyed using someone else's GPU. I just had an AMD Radeon RX 5600 XT, and the usual PyTorch GPU setup on Windows wasn't exactly made for it. I accepted that for quite a while.

Then, while looking for another machine-learning project, I came back to the same question. Why was I renting or borrowing compute when I already owned a GPU? Surely there's *some* way to make this work?

Well, there is more going on here than simply installing a different Python package. And that's how I ended up with TorchVK.

### Wait, why not just use the GPU?

If you've trained neural networks with PyTorch, you've probably seen `torch.cuda`. CUDA is NVIDIA's compute platform, and PyTorch has a very mature training backend for it. AMD has [ROCm](https://rocm.docs.amd.com/), but availability depends on the GPU, operating system and software versions. My particular RX 5600 XT on Windows doesn't have the same convenient supported route.

Meanwhile, I can run graphics applications on the card just fine. Graphics APIs such as [Vulkan](https://www.vulkan.org/) already provide a way to send compute workloads to GPUs across different vendors.

So the thought was: what if I could make PyTorch talk to Vulkan?

That isn't the same as making a game render with Vulkan. Training needs things like tensor storage, matrix operations, gradients and updates to model weights. A backend has to do those calculations correctly, then do them quickly enough to justify using the GPU at all.

### I wasn't the first person to think of this

I'll admit, the initial idea sounded pretty cool. A PyTorch training backend that doesn't depend on CUDA? Nice.

Then I started researching it.

Turns out projects such as [torchvulkan](https://github.com/zainsharief/torchvulkan) already explore PyTorch training through Vulkan, and other Vulkan integrations have existed too. Claiming that nobody has attempted this would be nonsense.

But their existence doesn't automatically answer *my* question: can I get a reproducible, GPU-only training path working on an older RDNA1 card with only 6 GB of VRAM, under Windows? What falls back to the CPU? What breaks? Where does the performance go?

That's the gap I want to investigate. And if someone else's backend already solves it better, I'd rather contribute to that than build a worse copy just so I can put my name on it.

### What the backend might actually look like

PyTorch is not going to start sending Vulkan commands just because I ask nicely. It needs a device integration layer. One route worth evaluating is **PrivateUse1**, a PyTorch extension mechanism for registering custom devices and their operations.

My current architectural hypothesis looks roughly like this:

```flow
PyTorch operation
PrivateUse1 custom device integration
TorchVK C++ runtime: memory, dispatch, synchronization
Vulkan compute pipeline
SPIR-V shader running on the GPU
```

SPIR-V is the intermediate representation used by Vulkan shaders: code written in something like GLSL or Slang is compiled into a form a Vulkan driver can consume. This diagram is a **proposed architecture**, not something I have running today.

And before I'd even think about implementing a neural network, I'd have to get the boring foundations right. Device selection, buffer allocation, copying values to and from GPU memory, dispatching a shader, waiting for completion, then comparing its output against a trusted CPU result.

"Just do a vector addition" sounds extremely underwhelming for a machine-learning project. But if a small addition is wrong, there's absolutely no point in building backpropagation on top of it.

### Six experiments, and why I'm writing them down first

The research plan currently lists six experiments. They aren't results; they're questions I want the implementation to answer.

1. **Vector addition:** can Vulkan compute the right values, and when do memory transfer and dispatch overhead dominate?
2. **Matrix multiplication:** how does performance change with matrix size, memory access and shader design?
3. **MNIST training:** can a small network complete forward and backward passes without accidentally switching to CPU?
4. **CIFAR-10 CNN:** what happens when the workload becomes more realistic and contains convolutions?
5. **Low-VRAM behavior:** how much memory is consumed, and what fails first on a 6 GB card?
6. **Ablations:** if I change one implementation choice at a time, which choices actually matter?

An *ablation* simply means isolating one part of a system to see whether it causes the observed difference. It's easy to change three things, see a faster benchmark and declare victory. It's much harder to know which change helped.

I also want to distinguish GPU execution time from total end-to-end time. A shader being fast means very little if copying data, synchronizing the device or switching execution paths eats the rest of the time.

### The awkward part: there's no result yet

This is probably the least impressive paragraph on the page, but it's important.

As of the documented research stage, **there is no working TorchVK backend, no implemented compute shader and no benchmark result I can honestly claim**. The public repository has the roadmap, related-work notes and an evaluation plan.

I'm deliberately not presenting the architecture diagram above as finished software or making up performance numbers. The first real milestone is simple: run one GPU operation, verify its output, and establish that it didn't silently fall back to the CPU.

After that, we'll see whether the original idea still makes sense.

### What I want to find out next

Maybe Vulkan will be a practical route to using my card for small training workloads. Maybe another backend will turn out to be the better solution. Maybe the overhead will make the whole thing slower than I hoped.

All three outcomes would teach me something about GPU systems.

The motivation hasn't changed, though: I own a GPU, I want to understand how it works below the machine-learning framework, and I'd love to stop treating Kaggle as the only possible answer to that problem.

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
