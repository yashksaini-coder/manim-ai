manimDocs = """
# 📚 Manim Quick Reference

This is a concise, categorized index of Manim's main modules, classes, and functions. Use this as a quick lookup for animation, mobject, and scene building blocks.

---

## ✨ Animations
- **animation**
  - [Animation](reference/manim.animation.animation.Animation.html): Base class for all animations
  - [Wait](reference/manim.animation.animation.Wait.html): Pause in the animation
  - [override_animation()](reference/manim.animation.animation.html#manim.animation.animation.override_animation)
  - [prepare_animation()](reference/manim.animation.animation.html#manim.animation.animation.prepare_animation)
- **changing**
  - [AnimatedBoundary](reference/manim.animation.changing.AnimatedBoundary.html)
  - [TracedPath](reference/manim.animation.changing.TracedPath.html)
- **composition**
  - [AnimationGroup](reference/manim.animation.composition.AnimationGroup.html)
  - [LaggedStart](reference/manim.animation.composition.LaggedStart.html)
  - [Succession](reference/manim.animation.composition.Succession.html)
- **creation**
  - [Create](reference/manim.animation.creation.Create.html): Draw an object
  - [Write](reference/manim.animation.creation.Write.html): Write text or objects
  - [Uncreate](reference/manim.animation.creation.Uncreate.html): Reverse of Create
  - [DrawBorderThenFill](reference/manim.animation.creation.DrawBorderThenFill.html)
  - [ShowIncreasingSubsets](reference/manim.animation.creation.ShowIncreasingSubsets.html)
- **fading**
  - [FadeIn](reference/manim.animation.fading.FadeIn.html)
  - [FadeOut](reference/manim.animation.fading.FadeOut.html)
- **growing**
  - [GrowArrow](reference/manim.animation.growing.GrowArrow.html)
  - [GrowFromCenter](reference/manim.animation.growing.GrowFromCenter.html)
- **indication**
  - [ApplyWave](reference/manim.animation.indication.ApplyWave.html)
  - [Circumscribe](reference/manim.animation.indication.Circumscribe.html)
  - [Indicate](reference/manim.animation.indication.Indicate.html)
- **movement**
  - [MoveAlongPath](reference/manim.animation.movement.MoveAlongPath.html)
- **numbers**
  - [ChangeDecimalToValue](reference/manim.animation.numbers.ChangeDecimalToValue.html)
- **rotation**
  - [Rotate](reference/manim.animation.rotation.Rotate.html)
- **transform**
  - [Transform](reference/manim.animation.transform.Transform.html)
  - [ReplacementTransform](reference/manim.animation.transform.ReplacementTransform.html)
  - [FadeTransform](reference/manim.animation.transform.FadeTransform.html)
  - [ApplyFunction](reference/manim.animation.transform.ApplyFunction.html)
  - [ApplyMatrix](reference/manim.animation.transform.ApplyMatrix.html)
  - [MoveToTarget](reference/manim.animation.transform.MoveToTarget.html)

---

## 🎥 Cameras
- [Camera](reference/manim.camera.camera.Camera.html)
- [MovingCamera](reference/manim.camera.moving_camera.MovingCamera.html)
- [ThreeDCamera](reference/manim.camera.three_d_camera.ThreeDCamera.html)

---

## 🧩 Mobjects
- **frame**
  - [FullScreenRectangle](reference/manim.mobject.frame.FullScreenRectangle.html)
- **geometry**
  - [Circle](reference/manim.mobject.geometry.html)
  - [Square](reference/manim.mobject.geometry.html)
  - [Polygon](reference/manim.mobject.geometry.html)
- **graph**
  - [Graph](reference/manim.mobject.graph.Graph.html)
- **matrix**
  - [Matrix](reference/manim.mobject.matrix.Matrix.html)
- **mobject**
  - [Mobject](reference/manim.mobject.mobject.Mobject.html)
  - [Group](reference/manim.mobject.mobject.Group.html)
- **table**
  - [Table](reference/manim.mobject.table.Table.html)
- **text**
  - [Text](reference/manim.mobject.text.html)
- **three_d**
  - [Sphere](reference/manim.mobject.three_d.html)
- **value_tracker**
  - [ValueTracker](reference/manim.mobject.value_tracker.ValueTracker.html)
- **vector_field**
  - [VectorField](reference/manim.mobject.vector_field.VectorField.html)

---

## 🎬 Scenes
- [Scene](reference/manim.scene.scene.Scene.html): Base class for all scenes
- [ThreeDScene](reference/manim.scene.three_d_scene.ThreeDScene.html)
- [MovingCameraScene](reference/manim.scene.moving_camera_scene.MovingCameraScene.html)
- [ZoomedScene](reference/manim.scene.zoomed_scene.ZoomedScene.html)

---

## 🛠️ Utilities
- [bezier](reference/manim.utils.bezier.html)
- [color](reference/manim.utils.color.html)
- [rate_functions](reference/manim.utils.rate_functions.html)
- [sounds](reference/manim.utils.sounds.html)
- [tex](reference/manim.utils.tex.html)

---

**Tip:** For more details, see the [official Manim documentation](https://docs.manim.community/).
"""