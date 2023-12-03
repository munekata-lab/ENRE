import { useFormState } from "react-dom";
import { useState } from "react";
import SubmitButton from "./submitButton";
import { createUser } from "@/lib/authentication";
import { useRouter } from "next/navigation";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye, faEyeSlash } from "@fortawesome/free-solid-svg-icons";

const initialState = {
  message: "",
};

export default function SignUpComponent() {
  const router = useRouter();
  const [isPasswordView, setIsPasswordView] = useState(false);
  const [isPasswordConfirmView, setIsPasswordConfirmView] = useState(false);
  const [error, action] = useFormState(createUser, initialState);

  return (
    <main className="flex flex-col items-center justify-center min-h-screen py-2">
      <h1 className="text-2xl font-bold mb-4">新規登録</h1>
      <form action={action} className="w-full max-w-xs space-y-4">
        <div className="flex flex-col">
          <label htmlFor="email" className="mb-2">
            メールアドレス:
          </label>
          <input
            id="email"
            type="email"
            name="email"
            placeholder="メールアドレスを入力"
            required
            className="appearance-none rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          />
        </div>
        <div className="flex flex-col">
          <label htmlFor="password" className="mb-2">
            パスワード:
          </label>
          <div className="relative">
            <input
              id="password"
              type={isPasswordView ? "text" : "password"}
              name="password"
              placeholder="パスワードを入力"
              required
              minLength={6}
              className="appearance-none rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            />
            <span
              onClick={() => setIsPasswordView((prevState) => !prevState)}
              className="absolute right-0 top-0 mt-2 mr-2 cursor-pointer"
            >
              {isPasswordView ? (
                <FontAwesomeIcon icon={faEye} />
              ) : (
                <FontAwesomeIcon icon={faEyeSlash} />
              )}
            </span>
          </div>
        </div>
        <div className="flex flex-col">
          <label htmlFor="password" className="mb-2">
            パスワード(確認用):
          </label>
          <div className="relative">
            <input
              id="passwordConfirm"
              type={isPasswordConfirmView ? "text" : "password"}
              name="passwordConfirm"
              placeholder="パスワードを入力(確認用)"
              required
              minLength={6}
              className="appearance-none rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            />
            <span
              onClick={() =>
                setIsPasswordConfirmView((prevState) => !prevState)
              }
              className="absolute right-0 top-0 mt-2 mr-2 cursor-pointer"
            >
              {isPasswordConfirmView ? (
                <FontAwesomeIcon icon={faEye} />
              ) : (
                <FontAwesomeIcon icon={faEyeSlash} />
              )}
            </span>
          </div>
        </div>
        <div className="flex flex-col items-center justify-center">
          <SubmitButton title="新規登録" />
          <p className="text-red-500">{error?.message}</p>
        </div>
      </form>
      <div className="mt-4">
        <button
          onClick={() => router.push("/login")}
          className="inline-block align-baseline font-bold text-sm text-blue-500 hover:text-blue-800"
        >
          既に登録済みの方はこちら
        </button>
      </div>
    </main>
  );
}
