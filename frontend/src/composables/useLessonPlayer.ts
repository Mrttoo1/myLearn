import { computed, onBeforeUnmount, ref, watch } from 'vue'
import gsap from 'gsap'
import type { Ref } from 'vue'
import type { Lesson } from '@/lessons/content'

export function useLessonPlayer(lesson: Ref<Lesson>) {
  const index = ref(0)
  const progress = ref(1)
  const playing = ref(false)
  const moving = ref(false)
  const paused = ref(false)
  const speed = ref(1)
  let flight: gsap.core.Tween | undefined
  let readingPause: gsap.core.Tween | undefined
  const atEnd = computed(
    () => index.value === lesson.value.steps.length - 1 && progress.value === 1,
  )
  const running = computed(() => playing.value || (moving.value && !paused.value))

  function clearAnimations() {
    flight?.kill()
    readingPause?.kill()
    flight = undefined
    readingPause = undefined
  }
  function pause() {
    paused.value = moving.value && progress.value < 1
    playing.value = false
    flight?.pause()
    readingPause?.pause()
  }
  function send(target: number, animate: boolean) {
    clearAnimations()
    index.value = Math.max(0, Math.min(target, lesson.value.steps.length - 1))
    progress.value = animate ? 0 : 1
    moving.value = animate
    paused.value = false
    if (!animate) return
    // 单步也播放完整的一次发送；到达后停住，等待用户继续。
    flight = gsap
      .to(progress, {
        value: 1,
        duration: 0.95,
        ease: 'power2.inOut',
        onComplete() {
          moving.value = false
          if (!playing.value) return
          if (atEnd.value) {
            playing.value = false
            return
          }
          // 使用有时长的等待动画，让倍速和暂停也作用于消息之间的阅读停顿。
          readingPause = gsap
            .to(
              {},
              {
                duration: 1.65,
                onComplete: () => {
                  if (playing.value) send(index.value + 1, true)
                },
              },
            )
            .timeScale(speed.value)
        },
      })
      .timeScale(speed.value)
  }
  function goTo(target: number, animate = true) {
    playing.value = false
    send(target, animate)
  }
  function reset() {
    playing.value = false
    send(0, false)
  }
  function toggle() {
    if (running.value) {
      pause()
      return
    }
    playing.value = true
    if (flight?.paused() && progress.value < 1) {
      paused.value = false
      flight.resume()
      return
    }
    if (readingPause?.paused()) {
      readingPause.resume()
      return
    }
    send(atEnd.value ? 0 : Math.min(index.value + 1, lesson.value.steps.length - 1), true)
  }

  watch(lesson, reset, { immediate: true })
  watch(speed, (value) => {
    flight?.timeScale(value)
    readingPause?.timeScale(value)
  })
  onBeforeUnmount(clearAnimations)
  return {
    index,
    progress,
    playing,
    moving,
    paused,
    running,
    speed,
    atEnd,
    goTo,
    reset,
    toggle,
    pause,
  }
}
