import { Suspense, useMemo, useState } from 'react'
import { Canvas } from '@react-three/fiber'
import { Html, OrbitControls } from '@react-three/drei'
import { Bottle, GlobalMotionLayer, products, useGlobalMotion, useRevealOnScroll } from './App'

type PurchaseProduct = (typeof products)[number]

function PurchaseHero({ active }: { active: PurchaseProduct }) {
  return (
    <div data-reveal className="grid gap-8 lg:grid-cols-[1.02fr_0.98fr] lg:items-stretch">
      <div className="glass-panel rounded-[2.75rem] border border-white/10 p-8 md:p-10">
        <p className="text-xs uppercase tracking-[0.55em] text-gold/75">Purchase Page</p>
        <h1 className="mt-4 max-w-xl text-4xl font-semibold leading-[0.92] text-white md:text-6xl">
          购买页面
          <span className="mt-3 block font-display text-3xl italic text-[#e8b547] md:text-5xl">Dedicated checkout view</span>
        </h1>
        <p className="mt-6 max-w-2xl text-sm leading-7 text-white/68 md:text-base">
          把购买流程单独拆出来，让首页继续承担品牌叙事，购买页专注于选酒、加购和下单信息。当前默认选中的是
          {active.name}。
        </p>

        <div className="mt-8 grid gap-3 sm:grid-cols-3">
          <div className="rounded-[1.25rem] border border-white/10 bg-white/[0.03] p-4">
            <p className="text-[11px] uppercase tracking-[0.4em] text-white/35">Batch</p>
            <p className="mt-3 text-lg text-white">Small</p>
          </div>
          <div className="rounded-[1.25rem] border border-white/10 bg-white/[0.03] p-4">
            <p className="text-[11px] uppercase tracking-[0.4em] text-white/35">Lead time</p>
            <p className="mt-3 text-lg text-white">2-4 days</p>
          </div>
          <div className="rounded-[1.25rem] border border-white/10 bg-white/[0.03] p-4">
            <p className="text-[11px] uppercase tracking-[0.4em] text-white/35">Gift box</p>
            <p className="mt-3 text-lg text-white">Included</p>
          </div>
        </div>

        <div className="mt-8 flex flex-wrap items-center gap-4">
          <a
            href="./index.html"
            className="rounded-full border border-white/10 bg-white/[0.04] px-6 py-3 text-sm tracking-[0.25em] text-white/80 transition hover:bg-white/[0.08]"
          >
            Back Home
          </a>
          <span className="text-xs uppercase tracking-[0.35em] text-white/35">Scroll for product selection</span>
        </div>
      </div>

      <div className="glass-panel rounded-[2.75rem] border border-white/10 p-5 md:p-6">
        <div className="relative min-h-[640px] overflow-hidden rounded-[2.15rem] border border-white/10 bg-[radial-gradient(circle_at_50%_20%,rgba(255,255,255,0.08),transparent_18%),linear-gradient(180deg,rgba(255,255,255,0.03),rgba(255,255,255,0.01))]">
          <div
            className="absolute inset-0"
            style={{
              background: `radial-gradient(circle at 50% 50%, ${active.tint}32 0%, transparent 34%), radial-gradient(circle at 50% 50%, ${active.accent}1f 0%, transparent 16%), linear-gradient(180deg, rgba(255,255,255,0.05), transparent 70%)`,
            }}
          />
          <div className="absolute inset-x-0 top-0 h-24 bg-[linear-gradient(180deg,rgba(255,255,255,0.08),transparent)] opacity-60" />
          <div className="absolute left-6 top-6 flex items-center gap-3">
            <span
              className="h-2.5 w-2.5 rounded-full"
              style={{ background: active.accent, boxShadow: `0 0 18px ${active.accent}cc` }}
            />
            <span className="text-[11px] uppercase tracking-[0.5em] text-white/45">Selected bottle</span>
          </div>
          <div className="absolute right-6 top-6 text-right text-[11px] uppercase tracking-[0.45em] text-white/35">
            <div>{active.short}</div>
            <div className="mt-2 text-white/55">{active.price}</div>
          </div>
          <Canvas className="absolute inset-0 h-full w-full" camera={{ position: [0, 0.1, 5.5], fov: 35 }} dpr={[1, 1.6]}>
            <ambientLight intensity={0.75} />
            <directionalLight position={[-3, 5, 4]} intensity={2.8} color="#ffdba8" />
            <directionalLight position={[2, -2, 1]} intensity={0.45} color="#6d3a14" />
            <Suspense fallback={<Html center className="text-white/50">Loading bottle...</Html>}>
              <Bottle active hover scroll={24} label={active.name} />
            </Suspense>
            <OrbitControls enableZoom={false} enablePan={false} minPolarAngle={Math.PI / 2.15} maxPolarAngle={Math.PI / 2.15} />
          </Canvas>
          <div className="absolute bottom-5 left-5 right-5 grid gap-3 md:grid-cols-[1.2fr_0.8fr]">
            <div className="rounded-[1.4rem] border border-white/10 bg-black/25 p-4 backdrop-blur-md">
              <p className="text-[11px] uppercase tracking-[0.45em] text-white/35">Flavor note</p>
              <div className="mt-3 flex items-end gap-3">
                <h2 className="text-3xl font-semibold text-white">{active.name}</h2>
                <span className="pb-1 text-xs uppercase tracking-[0.45em] text-white/35">{active.short}</span>
              </div>
              <p className="mt-4 text-sm leading-7 text-white/70">{active.note}</p>
            </div>
            <div className="rounded-[1.4rem] border border-white/10 bg-black/18 p-4 backdrop-blur-md">
              <p className="text-[11px] uppercase tracking-[0.45em] text-white/35">Order path</p>
              <div className="mt-4 h-2 overflow-hidden rounded-full bg-white/8">
                <div className="h-full w-[72%] rounded-full bg-[linear-gradient(90deg,rgba(232,181,71,0.4),rgba(240,212,154,0.95))]" />
              </div>
              <p className="mt-3 text-sm leading-6 text-white/60">Choose bottle, set quantity, then confirm the order summary below.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function ProductPicker({ active, onSelect }: { active: PurchaseProduct; onSelect: (product: PurchaseProduct) => void }) {
  return (
    <section data-reveal className="py-8 md:py-12">
      <div className="section-shell">
        <div className="mb-6 flex items-end justify-between gap-6">
          <div>
            <p className="text-xs uppercase tracking-[0.55em] text-gold/75">Bottle Menu</p>
            <h2 className="mt-3 text-3xl font-semibold text-white md:text-5xl">选择酒款</h2>
          </div>
          <p className="max-w-xl text-sm leading-7 text-white/60">点击任一酒款即可切换瓶身和摘要信息，页面会保持同样的动态光感。</p>
        </div>

        <div className="grid gap-4 lg:grid-cols-3">
          {products.map((product) => {
            const selected = product.id === active.id
            return (
              <button
                key={product.name}
                onClick={() => onSelect(product)}
                className={`rounded-[1.7rem] border p-5 text-left transition duration-300 ${
                  selected
                    ? 'border-white/20 bg-white/[0.09] shadow-[0_16px_48px_rgba(0,0,0,0.24)]'
                    : 'border-white/8 bg-white/[0.03] hover:-translate-y-1 hover:border-white/14 hover:bg-white/[0.06]'
                }`}
              >
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-xs uppercase tracking-[0.45em] text-white/35">Series</p>
                    <h3 className="mt-3 text-2xl font-semibold text-white">{product.name}</h3>
                  </div>
                  <span className="text-sm text-[#f3e8d8]">{product.price}</span>
                </div>
                <p className="mt-4 text-sm leading-7 text-white/68">{product.note}</p>
                <div className="mt-6 flex items-center gap-3 text-[11px] uppercase tracking-[0.35em] text-white/35">
                  <span className="h-2.5 w-2.5 rounded-full" style={{ background: product.accent, boxShadow: `0 0 18px ${product.accent}aa` }} />
                  <span>{selected ? 'Selected' : 'Tap to switch'}</span>
                </div>
              </button>
            )
          })}
        </div>
      </div>
    </section>
  )
}

type ShippingMethod = 'standard' | 'express' | 'gift'

function CheckoutPanel({
  active,
  quantity,
  setQuantity,
  shipping,
  setShipping,
}: {
  active: PurchaseProduct
  quantity: number
  setQuantity: (value: number) => void
  shipping: ShippingMethod
  setShipping: (value: ShippingMethod) => void
}) {
  const total = useMemo(() => {
    const price = Number.parseInt(active.price.replace(/[^\d]/g, ''), 10)
    const shippingFee = shipping === 'standard' ? 0 : shipping === 'express' ? 80 : 120
    return price * quantity + shippingFee
  }, [active.price, quantity, shipping])

  return (
    <section data-reveal className="py-10 md:py-16">
      <div className="section-shell grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
        <div className="glass-panel rounded-[2.5rem] border border-white/10 p-8">
          <p className="text-xs uppercase tracking-[0.55em] text-gold/75">Checkout</p>
          <h2 className="mt-4 text-3xl font-semibold text-white md:text-5xl">购买摘要</h2>
          <p className="mt-5 text-sm leading-7 text-white/62">当前订单会随着右侧酒款切换自动更新，保留你想要的那种手感，但结构更明确。</p>

          <div className="mt-8 flex items-center gap-4">
            <button
              className="h-12 w-12 rounded-full border border-white/10 bg-white/5 text-xl transition hover:bg-white/10"
              onClick={() => setQuantity(Math.max(1, quantity - 1))}
            >
              −
            </button>
            <div className="min-w-12 text-center text-lg">{String(quantity).padStart(2, '0')}</div>
            <button
              className="h-12 w-12 rounded-full border border-white/10 bg-white/5 text-xl transition hover:bg-white/10"
              onClick={() => setQuantity(quantity + 1)}
            >
              +
            </button>
            <button className="ml-4 rounded-full bg-[#f0d49a] px-8 py-3 text-sm tracking-[0.3em] text-black transition hover:brightness-110">
              Add to Cart
            </button>
          </div>

          <div className="mt-8 grid gap-3 sm:grid-cols-2">
            <div className="rounded-[1.25rem] border border-white/10 bg-white/[0.03] p-4">
              <p className="text-[11px] uppercase tracking-[0.4em] text-white/35">Selected</p>
              <p className="mt-3 text-lg text-white">{active.name}</p>
            </div>
            <div className="rounded-[1.25rem] border border-white/10 bg-white/[0.03] p-4">
              <p className="text-[11px] uppercase tracking-[0.4em] text-white/35">Total</p>
              <p className="mt-3 text-lg text-white">¥{total.toLocaleString('zh-CN')}</p>
            </div>
          </div>

          <div className="mt-8 rounded-[1.5rem] border border-white/10 bg-white/[0.03] p-4">
            <p className="text-xs uppercase tracking-[0.45em] text-white/35">Shipping method</p>
            <div className="mt-4 grid gap-3">
              {(
                [
                  ['standard', 'Standard', '2-4 days / free'],
                  ['express', 'Express', '1-2 days / ¥80'],
                  ['gift', 'Gift box', 'Priority wrap / ¥120'],
                ] as const
              ).map(([value, label, desc]) => {
                const selected = shipping === value
                return (
                  <button
                    key={value}
                    onClick={() => setShipping(value)}
                    className={`flex items-center justify-between rounded-[1.15rem] border px-4 py-3 text-left transition ${
                      selected
                        ? 'border-white/20 bg-white/[0.09]'
                        : 'border-white/8 bg-white/[0.03] hover:border-white/14 hover:bg-white/[0.06]'
                    }`}
                  >
                    <span>
                      <span className="block text-sm text-white">{label}</span>
                      <span className="block text-[11px] uppercase tracking-[0.3em] text-white/35">{desc}</span>
                    </span>
                    <span className="h-3 w-3 rounded-full" style={{ background: selected ? active.accent : 'rgba(255,255,255,0.22)' }} />
                  </button>
                )
              })}
            </div>
          </div>

          <div className="mt-8 rounded-[1.5rem] border border-white/10 bg-white/[0.03] p-4">
            <p className="text-xs uppercase tracking-[0.45em] text-white/35">Order status</p>
            <div className="mt-4 flex items-center justify-between text-xs uppercase tracking-[0.35em] text-white/35">
              <span>Cart</span>
              <span>Payment</span>
              <span>Delivery</span>
              <span>Done</span>
            </div>
            <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/8">
              <div className="h-full w-[66%] rounded-full bg-[linear-gradient(90deg,rgba(232,181,71,0.4),rgba(240,212,154,0.95))]" />
            </div>
          </div>
        </div>

        <div className="grid gap-6">
          <div className="rounded-[2.5rem] border border-white/10 bg-white/[0.03] p-8">
            <p className="text-xs uppercase tracking-[0.55em] text-gold/75">Shipping</p>
            <div className="mt-5 space-y-5 text-sm leading-8 text-white/68">
              <p>
                Shizuko 采用低干预发售方式，限量批次会按季释放。下单后将优先发出当前批次现货，并附赠礼盒包装。
              </p>
              <p>
                推荐与冷藏水滴杯、高脚闻香杯搭配使用，让香气在前、中、后段的展开更清晰。
              </p>
              <p>
                如果你想回到品牌首页继续浏览，可以直接返回；如果要下单，当前页面已经把最需要的操作路径保留下来了。
              </p>
            </div>
            <div className="mt-8 flex flex-wrap items-center gap-4">
              <a
                href="./index.html"
                className="rounded-full border border-white/10 bg-white/[0.04] px-6 py-3 text-sm tracking-[0.25em] text-white/80 transition hover:bg-white/[0.08]"
              >
                Back Home
              </a>
              <a
                href="#top"
                className="rounded-full border border-white/10 bg-white/[0.04] px-6 py-3 text-sm tracking-[0.25em] text-white/80 transition hover:bg-white/[0.08]"
              >
                Back to top
              </a>
            </div>
          </div>

          <div className="rounded-[2.5rem] border border-white/10 bg-white/[0.03] p-8">
            <p className="text-xs uppercase tracking-[0.55em] text-gold/75">FAQ</p>
            <div className="mt-5 space-y-4 text-sm leading-7 text-white/68">
              <div className="rounded-[1.25rem] border border-white/10 bg-black/15 p-4">
                <p className="text-white">How long does dispatch take?</p>
                <p className="mt-2">通常 2-4 个工作日完成发货，礼盒或加急会额外占用 1-2 天处理时间。</p>
              </div>
              <div className="rounded-[1.25rem] border border-white/10 bg-black/15 p-4">
                <p className="text-white">Can I send it as a gift?</p>
                <p className="mt-2">可以，购买页已把礼盒、加急配送和发货优先级作为独立选项预留。</p>
              </div>
              <div className="rounded-[1.25rem] border border-white/10 bg-black/15 p-4">
                <p className="text-white">Can I change the quantity?</p>
                <p className="mt-2">可以，左侧摘要里可以直接增减数量，底部总价会实时刷新。</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="section-shell mt-6 md:mt-8">
        <div className="grid gap-6 lg:grid-cols-[1fr_1fr]">
          <div className="rounded-[2.5rem] border border-white/10 bg-white/[0.03] p-8">
            <p className="text-xs uppercase tracking-[0.55em] text-gold/75">Recipient</p>
            <h3 className="mt-4 text-2xl font-semibold text-white">收件信息</h3>
            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <label className="grid gap-2">
                <span className="text-[11px] uppercase tracking-[0.35em] text-white/35">Full name</span>
                <input className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-white outline-none placeholder:text-white/25" placeholder="Shizuko Collector" />
              </label>
              <label className="grid gap-2">
                <span className="text-[11px] uppercase tracking-[0.35em] text-white/35">Phone</span>
                <input className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-white outline-none placeholder:text-white/25" placeholder="+86 138 0000 0000" />
              </label>
              <label className="grid gap-2 sm:col-span-2">
                <span className="text-[11px] uppercase tracking-[0.35em] text-white/35">Address</span>
                <input className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-white outline-none placeholder:text-white/25" placeholder="Street, building, apartment number" />
              </label>
              <label className="grid gap-2 sm:col-span-2">
                <span className="text-[11px] uppercase tracking-[0.35em] text-white/35">Note</span>
                <textarea
                  className="min-h-[120px] rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-white outline-none placeholder:text-white/25"
                  placeholder="Gift message, delivery preference, or tasting note..."
                />
              </label>
            </div>
          </div>

          <div className="rounded-[2.5rem] border border-white/10 bg-white/[0.03] p-8">
            <p className="text-xs uppercase tracking-[0.55em] text-gold/75">Payment</p>
            <h3 className="mt-4 text-2xl font-semibold text-white">付款方式</h3>
            <div className="mt-6 grid gap-3">
              {[
                ['Card', 'Visa / Mastercard / Amex'],
                ['Apple Pay', 'Fast mobile checkout'],
                ['Alipay', 'Popular local wallet'],
              ].map(([name, desc]) => (
                <div
                  key={name}
                  className="flex items-center justify-between rounded-[1.25rem] border border-white/10 bg-black/15 px-4 py-4"
                >
                  <div>
                    <p className="text-white">{name}</p>
                    <p className="mt-1 text-[11px] uppercase tracking-[0.3em] text-white/35">{desc}</p>
                  </div>
                  <span className="h-3 w-3 rounded-full bg-[#f0cf6a]" />
                </div>
              ))}
            </div>
            <button className="mt-8 w-full rounded-full bg-[#f0d49a] px-8 py-4 text-sm tracking-[0.3em] text-black transition hover:brightness-110">
              Confirm Order
            </button>
          </div>
        </div>
      </div>
    </section>
  )
}

export default function PurchasePage() {
  useGlobalMotion()
  useRevealOnScroll()
  const [active, setActive] = useState(products[1])
  const [quantity, setQuantity] = useState(1)
  const [shipping, setShipping] = useState<ShippingMethod>('standard')

  return (
    <div id="top" className="relative isolate min-h-screen">
      <GlobalMotionLayer />
      <div className="noise z-10" />
      <div className="relative z-20 pb-16">
        <header className="section-shell flex flex-wrap items-center justify-between gap-4 py-6">
          <div>
            <p className="text-xs uppercase tracking-[0.55em] text-gold/75">Shizuko Whisky</p>
            <p className="mt-2 text-[11px] uppercase tracking-[0.4em] text-white/35">Purchase / Checkout</p>
          </div>
          <a
            href="./index.html"
            className="rounded-full border border-white/10 bg-white/[0.04] px-5 py-2.5 text-xs uppercase tracking-[0.35em] text-white/75 transition hover:bg-white/[0.08]"
          >
            Home
          </a>
        </header>

        <main className="space-y-8 md:space-y-10">
          <div className="section-shell">
            <PurchaseHero active={active} />
          </div>
          <ProductPicker active={active} onSelect={setActive} />
          <CheckoutPanel
            active={active}
            quantity={quantity}
            setQuantity={setQuantity}
            shipping={shipping}
            setShipping={setShipping}
          />
        </main>
      </div>
    </div>
  )
}
