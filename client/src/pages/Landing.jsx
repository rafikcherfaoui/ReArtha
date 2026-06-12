import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../api/axios'

export default function Landing() {
  const [stats, setStats] = useState(null)

  // fetch public stats on mount
  useEffect(() => {
    api.get('/stats/public')
      .then((res) => setStats(res.data))
      .catch(() => null)
  }, [])

  return (
    <div style={{ fontFamily: 'Arial, sans-serif', color: '#111', background: '#fff' }}>
      
      {/* 1. FIXED NAVBAR */}
      <header style={{
        background: '#1a3d2b',
        padding: '16px 40px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderBottom: '1px solid rgba(255,255,255,0.05)',
        position: 'sticky',
        top: 0,
        zIndex: 100
      }}>
        {/* Added Brand Name to the Left so space-between works */}
        <Link to="/" style={{ textDecoration: 'none', color: '#fff', fontWeight: 'bold', fontSize: 20 }}>
          Re<span style={{ color: '#2e7d52' }}>Artha</span>
        </Link>
        
        {/* Fixed CSS naming typo & adjusted spacing */}
        <nav style={{ display: 'flex', gap: 24, alignItems: 'center' }}>
          <a href="#how-it-works" style={{ color: 'rgba(255,255,255,0.7)', fontSize: 14, textDecoration: 'none', fontWeight: 500 }}>How it works</a>
          <a href="#rewards" style={{ color: 'rgba(255,255,255,0.7)', fontSize: 14, textDecoration: 'none', fontWeight: 500 }}>Rewards</a>
          <Link to="/login" style={{ 
            color: '#fff', 
            fontSize: 14, 
            textDecoration: 'none',
            background: 'rgba(255,255,255,0.1)',
            padding: '6px 16px',
            borderRadius: 4,
            fontWeight: 500,
            transition: '0.2s'
          }}>
            Sign in
          </Link>
        </nav>
      </header>

      {/* 2. REMOVED THE BROKEN EXTRA DIV WRAPPER TO PREVENT LAYOUT BUGS */}

      {/* hero */}
      <section style={{
        background: '#1a3d2b',
        color: '#fff',
        padding: '80px 24px',
        textAlign: 'center',
      }}>
        <span style={{ color: '#fff', fontWeight: 'bold', fontSize: 50, marginBottom: 50, display: 'block' }}>
          Re<span style={{ color: '#2e7d52' }}>Artha</span>
        </span>
        <h1 style={{ fontSize: 36, marginBottom: 16 }}>
          Turn used diapers into rewards
        </h1>
        <p style={{ fontSize: 16, color: '#aaa', maxWidth: 480, margin: '0 auto 32px' }}>
          Drop off used diapers at a nearby collection center, earn points,
          and redeem them for products and vouchers.
        </p>
        <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link to="/register" style={{
            background: '#2e7d52',
            color: '#fff',
            padding: '12px 24px',
            borderRadius: 6,
            fontWeight: 'bold',
            fontSize: 15,
            textDecoration: 'none'
          }}>
            Get started
          </Link>
          <a href="#how-it-works" style={{
            background: 'transparent',
            border: '1px solid #555',
            color: '#ccc',
            padding: '12px 24px',
            borderRadius: 6,
            fontSize: 15,
            textDecoration: 'none'
          }}>
            Learn more
          </a>
        </div>
      </section>

      {/* stats */}
      <section style={{
        background: '#14532d',
        padding: '40px 24px',
        display: 'flex',
        justifyContent: 'center',
        gap: 64,
        flexWrap: 'wrap',
      }}>
        <div style={{ textAlign: 'center', color: '#fff' }}>
          <div style={{ fontSize: 32, fontWeight: 'bold' }}>
            {stats?.validatedDeposits ?? '--'}
          </div>
          <div style={{ fontSize: 13, color: '#aaa', marginTop: 4 }}>
            Deposits validated
          </div>
        </div>
        <div style={{ textAlign: 'center', color: '#fff' }}>
          <div style={{ fontSize: 32, fontWeight: 'bold' }}>
            {stats?.totalPointsAwarded ?? '--'}
          </div>
          <div style={{ fontSize: 13, color: '#aaa', marginTop: 4 }}>
            Points awarded
          </div>
        </div>
        <div style={{ textAlign: 'center', color: '#fff' }}>
          <div style={{ fontSize: 32, fontWeight: 'bold' }}>
            {stats?.totalUsers ?? '--'}
          </div>
          <div style={{ fontSize: 13, color: '#aaa', marginTop: 4 }}>
            Registered users
          </div>
        </div>
      </section>

      {/* how it works */}
      <section id="how-it-works" style={{ padding: '60px 24px', background: '#fff' }}>
        <div style={{ maxWidth: 900, margin: '0 auto' }}>
          <h2 style={{ textAlign: 'center', marginBottom: 40, fontSize: 26 }}>
            How it works
          </h2>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: 32,
          }}>
            <div>
              <h3 style={{ marginBottom: 8 }}>1. Drop off diapers</h3>
              <p style={{ color: '#555', lineHeight: 1.6, fontSize: 14 }}>
                Bring your used diapers to the nearest collection center.
                The staff will give you a deposit code.
              </p>
            </div>
            <div>
              <h3 style={{ marginBottom: 8 }}>2. Enter the code</h3>
              <p style={{ color: '#555', lineHeight: 1.6, fontSize: 14 }}>
                Log into your account and enter the code. 15 points are
                added to your balance right away.
              </p>
            </div>
            <div>
              <h3 style={{ marginBottom: 8 }}>3. Redeem a reward</h3>
              <p style={{ color: '#555', lineHeight: 1.6, fontSize: 14 }}>
                Go to the rewards page and spend your points on products
                or vouchers.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* rewards */}
      <section id="rewards" style={{ padding: '60px 24px', background: '#f5f5f5' }}>
        <div style={{ maxWidth: 900, margin: '0 auto' }}>
          <h2 style={{ textAlign: 'center', marginBottom: 40, fontSize: 26 }}>
            Available rewards
          </h2>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
            gap: 16,
          }}>
            {[
              { title: 'Reusable shopping bag',    pts: 30,  type: 'Physical' },
              { title: 'Plant a tree certificate', pts: 50,  type: 'Digital'  },
              { title: 'Organic baby wipes pack',  pts: 45,  type: 'Physical' },
              { title: 'Stainless steel bottle',   pts: 80,  type: 'Physical' },
              { title: 'Faderco voucher 10%',      pts: 60,  type: 'Digital'  },
              { title: 'Eco starter kit',          pts: 120, type: 'Physical' },
            ].map((item) => (
              <div key={item.title} style={{
                background: '#fff',
                border: '1px solid #ddd',
                borderRadius: 8,
                padding: 16,
              }}>
                <div style={{ fontWeight: '600', fontSize: 14, marginBottom: 12 }}>
                  {item.title}
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontWeight: 'bold', color: '#2e7d52', fontSize: 15 }}>
                    {item.pts} pts
                  </span>
                  <span style={{ fontSize: 11, color: '#888', background: '#eee', padding: '2px 8px', borderRadius: 4 }}>
                    {item.type}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* cta */}
      <section style={{
        background: '#1a3d2b',
        color: '#fff',
        textAlign: 'center',
        padding: '60px 24px',
      }}>
        <h2 style={{ fontSize: 26, marginBottom: 12 }}>
          Ready to get started?
        </h2>
        <p style={{ color: '#aaa', marginBottom: 28, fontSize: 15 }}>
          Create an account and start earning points from your first deposit.
        </p>
        <Link to="/register" style={{
          background: '#2e7d52',
          color: '#fff',
          padding: '12px 28px',
          borderRadius: 6,
          fontWeight: 'bold',
          fontSize: 15,
          textDecoration: 'none'
        }}>
          Create an account
        </Link>
      </section>

      {/* footer */}
      <footer style={{
        background: '#1a3d2b',
        color: '#ffffff',
        textAlign: 'center',
        padding: '20px 24px',
        fontSize: 13,
      }}>
        <p>ReArtha &copy; {new Date().getFullYear()}</p>
      </footer>

    </div>
  )
}