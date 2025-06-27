import Footer from "../components/footer";
import Header from "../components/header";

const Home = () => {
    return (
        <div className="flex flex-col min-h-screen">
            <Header />
            <main className="flex-grow">
                <section className="text-center py-16 px-4 bg-white">
                    <h2 className="text-3xl md:text-4xl font-serif font-semibold mb-4">
                        Layanan Pelaporan Bugs Hundling
                    </h2>
                    <p className="text-md md:text-lg text-gray-700">
                        Sampaikan Aduan Anda Jika Menemukan Bugs Pada Aplikasi/Website Pemerintah
                    </p>
                </section>
            </main>
            <Footer />
        </div>
    );
};

export default Home;