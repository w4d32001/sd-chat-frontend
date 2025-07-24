const AuthImagePattern = ({ title, subtitle }) => {
    return (
        <div className="hidden lg:flex items-center justify-center bg-base-200 p-12 rounded-r-3xl">
            <div className="max-w-md text-center">
                <div className=" gap-3 mb-8 w-full">
                    <img src="/login2.png" alt="" className="w-[500px] h-[500px]" />
                </div>
                <h2 className="text-2xl font-bold mb-4">{title}</h2>
                <p className="text-base-content/60">{subtitle}</p>
            </div>
        </div>
    );
};

export default AuthImagePattern;
